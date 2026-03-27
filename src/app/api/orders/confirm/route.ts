import { Payment } from 'mercadopago';
import client from '@/lib/mercadopago';
import dbConnect from '@/lib/mongodb';
import Order from '@/model/Order';

// Este endpoint lo llama la página /success apenas carga.
// MercadoPago redirige al usuario a /success?payment_id=XXX&external_reference=YYY&status=approved
// Aquí verificamos el pago contra la API de MP y actualizamos la orden en MongoDB.
// Esto resuelve el problema de que el webhook no llega a localhost en desarrollo.

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { payment_id, external_reference } = await req.json();

    if (!payment_id || !external_reference) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros.' }), { status: 400 });
    }

    // Verificar el pago directamente con MercadoPago
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: payment_id });

    const status = paymentData.status;
    const mpExternalRef = paymentData.external_reference;

    // Doble check: el external_reference del pago tiene que coincidir
    if (mpExternalRef !== external_reference) {
      return new Response(JSON.stringify({ error: 'Referencia no coincide.' }), { status: 400 });
    }

    if (status === 'approved') {
      await Order.findOneAndUpdate(
        { external_reference: external_reference },
        { status: 'approved', payment_id: String(payment_id) },
        { new: true }
      );
    }

    return new Response(JSON.stringify({ status }), { status: 200 });

  } catch (error: any) {
    console.error('❌ Error en confirm:', error.message);
    return new Response(JSON.stringify({ error: 'Error interno.' }), { status: 500 });
  }
}
