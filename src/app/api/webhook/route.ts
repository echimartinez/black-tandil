import { Payment } from 'mercadopago';
import crypto from 'crypto';
import client from "../../../lib/mercadopago";
import dbConnect from "../../../lib/mongodb";
import Order from "../../../model/Order";
import User from "../../../model/User";
import { sendOrderConfirmation, sendNewOrderAdmin } from "@/lib/email";

const isDev = process.env.NODE_ENV === 'development';

function verifyMPSignature(req: Request): boolean {
  if (isDev) {
    console.log('🔓 Dev mode — verificación de firma omitida');
    return true;
  }

  try {
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');

    if (!xSignature || !xRequestId) {
      console.warn('⚠️ Webhook sin headers de firma — rechazado');
      return false;
    }

    const parts = Object.fromEntries(
      xSignature.split(',').map(part => part.split('=') as [string, string])
    );
    const ts = parts['ts'];
    const v1 = parts['v1'];

    if (!ts || !v1) {
      console.warn('⚠️ Formato de firma inválido');
      return false;
    }

    const url = new URL(req.url);
    const dataId = url.searchParams.get('data.id') ?? '';
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('⚠️ MP_WEBHOOK_SECRET no configurado — saltando verificación');
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(v1),
      Buffer.from(expectedSignature)
    );
  } catch (err: any) {
    console.error('❌ Error al verificar firma:', err.message);
    return false;
  }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    const isValid = verifyMPSignature(req);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Firma inválida' }), { status: 401 });
    }

    const paymentId = body.data?.id || body.id;
    const type = body.type || body.topic;

    console.log(`📡 Evento recibido: ${type} con ID: ${paymentId}`);

    if (type === 'payment' && paymentId) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });
      const status = paymentData.status;
      const externalReference = paymentData.external_reference;

      console.log(`💰 Pago ${paymentId}: ${status} (Ref: ${externalReference})`);

      if (status === 'approved') {
        const updatedOrder = await Order.findOneAndUpdate(
          { external_reference: externalReference },
          { status: 'approved', payment_id: String(paymentId) },
          { new: true }
        );

        if (updatedOrder) {
          console.log(`✅ Orden ${externalReference} marcada como PAGADA.`);

          // Buscar datos del usuario si tiene userId
          let userEmail: string | undefined;
          let userName: string | undefined;

          if (updatedOrder.userId) {
            const user = await User.findById(updatedOrder.userId).select('name email');
            if (user) {
              userEmail = user.email;
              userName = user.name;
            }
          }

          const orderData = {
            title: updatedOrder.title,
            amount: updatedOrder.amount,
            external_reference: updatedOrder.external_reference,
            userName,
            userEmail,
          };

          // Enviar emails en paralelo (no bloqueamos la respuesta si fallan)
          await Promise.allSettled([
            // Email al comprador (solo si tenemos su email)
            userEmail
              ? sendOrderConfirmation({ to: userEmail, order: orderData })
              : Promise.resolve(),

            // Email al admin siempre
            sendNewOrderAdmin({ order: orderData }),
          ]);

        } else {
          console.warn(`⚠️ No se encontró la orden ${externalReference}.`);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (error: any) {
    console.error('❌ Error en el Webhook:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 200 });
  }
}