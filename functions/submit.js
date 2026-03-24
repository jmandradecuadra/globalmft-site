export async function onRequestPost(context) {
  const { request, env } = context;
  const formData = await request.formData();

  // 1. Datos del Formulario
  const data = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    interest: formData.get("interest"),
    message: formData.get("message"),
    timestamp: new Date().toISOString(),
  };

  // 2. Validación de Turnstile
  const token = formData.get("cf-turnstile-response");
  const SECRET_KEY = "0x4AAAAAACvYqIoHaCVKBvb4bfBQwyADvSM";

  const verifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${SECRET_KEY}&response=${token}`,
    },
  );
  const outcome = await verifyResponse.json();

  if (!outcome.success) {
    return new Response("Error de seguridad", { status: 403 });
  }

  // 3. Guardar en R2 (Base de datos de objetos)
  // El nombre del archivo será: año-mes-dia-email.json
  const fileName = `contact_${Date.now()}_${data.email}.json`;
  await env.CONTACTS_BUCKET.put(fileName, JSON.stringify(data), {
    httpMetadata: { contentType: "application/json" },
  });

  // 4. Enviar Correo de Confirmación vía Resend
  // Nota: Debes añadir RESEND_API_KEY en las variables de entorno de Cloudflare
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Global MFT <info@globalmft.cobranext.com>",
      to: [data.email],
      subject: "We have received your inquiry - Global MFT",
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Hello ${data.first_name},</h2>
          <p>Thank you for reaching out to <strong>Global MFT</strong>.</p>
          <p>We have received your inquiry regarding <strong>${data.interest}</strong>. Our team is reviewing your information and will contact you shortly.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">This is an automated confirmation. Please do not reply to this email.</p>
        </div>
      `,
    }),
  });

  // Redirigir a una página de éxito (puedes crear success.html)
  return Response.redirect(
    `${new URL(request.url).origin}/contact.html?status=success`,
    303,
  );
}
