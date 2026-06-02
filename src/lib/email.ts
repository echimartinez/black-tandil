import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const ADMIN = process.env.ADMIN_EMAIL ?? '';
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://somosblack.ar';

// ─── Templates ────────────────────────────────────────────────────────────────

function baseWrapper(content: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BLACK</title>
</head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #E0DED8;">
          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:24px 32px;">
              <p style="margin:0;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:4px;text-transform:uppercase;">
                BLACK
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#555555;letter-spacing:3px;text-transform:uppercase;">
                somosblack.ar
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F5F4F0;padding:20px 32px;border-top:1px solid #E0DED8;">
              <p style="margin:0;font-size:11px;color:#888888;text-align:center;">
                © ${new Date().getFullYear()} BLACK · Argentina<br/>
                <a href="${SITE}" style="color:#888888;">somosblack.ar</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function orderConfirmationHtml(order: {
  title: string;
  amount: number;
  external_reference: string;
  userName?: string;
}) {
  const content = `
    <p style="margin:0 0 8px;font-size:13px;color:#888888;text-transform:uppercase;letter-spacing:2px;">
      ¡Pago confirmado!
    </p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:900;color:#111111;text-transform:uppercase;letter-spacing:1px;">
      Tu pedido está en camino
    </h1>

    <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.6;">
      Hola${order.userName ? ` <strong>${order.userName}</strong>` : ''}, gracias por tu compra.<br/>
      Recibimos tu pago y estamos preparando tu pedido.
    </p>

    <!-- Resumen del pedido -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;border:1px solid #E0DED8;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:2px;">Resumen del pedido</p>
          <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111111;">${order.title}</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#888888;">Referencia</td>
              <td align="right" style="font-size:13px;color:#111111;font-weight:600;">#${order.external_reference.slice(-8)}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#888888;padding-top:8px;">Total pagado</td>
              <td align="right" style="font-size:18px;color:#111111;font-weight:900;padding-top:8px;">
                $${order.amount.toLocaleString('es-AR')}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;font-size:14px;color:#666666;line-height:1.6;">
      Te avisaremos cuando tu pedido sea despachado. Si tenés alguna consulta,
      respondé este email o escribinos por Instagram <a href="https://instagram.com/somosblack.ar" style="color:#111111;">@somosblack.ar</a>.
    </p>

    <a href="${SITE}" style="display:inline-block;background:#111111;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding:14px 28px;text-decoration:none;">
      Seguir comprando
    </a>
  `;
  return baseWrapper(content);
}

function newOrderAdminHtml(order: {
  title: string;
  amount: number;
  external_reference: string;
  userEmail?: string;
  userName?: string;
}) {
  const content = `
    <p style="margin:0 0 8px;font-size:13px;color:#E63A2E;text-transform:uppercase;letter-spacing:2px;font-weight:700;">
      Nuevo pedido
    </p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:900;color:#111111;text-transform:uppercase;letter-spacing:1px;">
      Pago aprobado
    </h1>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;border:1px solid #E0DED8;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111111;">${order.title}</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#888888;">Referencia</td>
              <td align="right" style="font-size:13px;color:#111111;font-weight:600;">#${order.external_reference.slice(-8)}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#888888;padding-top:8px;">Cliente</td>
              <td align="right" style="font-size:13px;color:#111111;font-weight:600;padding-top:8px;">
                ${order.userName ?? '—'} ${order.userEmail ? `(${order.userEmail})` : ''}
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#888888;padding-top:8px;">Total</td>
              <td align="right" style="font-size:20px;color:#111111;font-weight:900;padding-top:8px;">
                $${order.amount.toLocaleString('es-AR')}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <a href="${SITE}/admin/ordenes" style="display:inline-block;background:#111111;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding:14px 28px;text-decoration:none;">
      Ver en el panel
    </a>
  `;
  return baseWrapper(content);
}

function welcomeHtml(userName: string) {
  const content = `
    <p style="margin:0 0 8px;font-size:13px;color:#888888;text-transform:uppercase;letter-spacing:2px;">
      Bienvenido/a
    </p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:900;color:#111111;text-transform:uppercase;letter-spacing:1px;">
      ¡Hola, ${userName}!
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.6;">
      Tu cuenta en <strong>BLACK</strong> fue creada exitosamente.
      Ya podés explorar nuestro catálogo y hacer tu primera compra.
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.6;">
      Hacemos envíos a todo el país y aceptamos todos los medios de pago
      a través de MercadoPago.
    </p>

    <a href="${SITE}" style="display:inline-block;background:#111111;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding:14px 28px;text-decoration:none;">
      Ver la tienda
    </a>
  `;
  return baseWrapper(content);
}

// ─── Send functions ────────────────────────────────────────────────────────────

export async function sendOrderConfirmation(params: {
  to: string;
  order: { title: string; amount: number; external_reference: string; userName?: string };
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: '✅ Pago recibido — BLACK',
      html: orderConfirmationHtml(params.order),
    });
    console.log(`✅ Email de confirmación enviado a ${params.to}`);
  } catch (err: any) {
    console.error('❌ Error enviando email de confirmación:', err.message);
  }
}

export async function sendNewOrderAdmin(params: {
  order: {
    title: string;
    amount: number;
    external_reference: string;
    userEmail?: string;
    userName?: string;
  };
}) {
  if (!ADMIN) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN,
      subject: `🛍️ Nuevo pedido — $${params.order.amount.toLocaleString('es-AR')}`,
      html: newOrderAdminHtml(params.order),
    });
    console.log('✅ Email de nuevo pedido enviado al admin');
  } catch (err: any) {
    console.error('❌ Error enviando email al admin:', err.message);
  }
}

export async function sendWelcomeEmail(params: { to: string; name: string }) {
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: '¡Bienvenido/a a BLACK!',
      html: welcomeHtml(params.name),
    });
    console.log(`✅ Email de bienvenida enviado a ${params.to}`);
  } catch (err: any) {
    console.error('❌ Error enviando email de bienvenida:', err.message);
  }
}