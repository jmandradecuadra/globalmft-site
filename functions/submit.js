export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    // 1. Datos del formulario
    const data = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone") || "N/A",
      interest: formData.get("interest"),
      message: formData.get("message"),
      timestamp: new Date().toISOString(),
    };

    // 2. Validación Turnstile
    const token = formData.get("cf-turnstile-response");
    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${env.TURNSTILE_SECRET_KEY}&response=${token}`,
      },
    );

    const outcome = await verifyResponse.json();
    if (!outcome.success) {
      return new Response("Security check failed.", { status: 403 });
    }

    // 3. Guardar en R2 → contacts-requests/
    const safeEmail = data.email.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `contacts-requests/${Date.now()}_${safeEmail}.json`;

    await env.GLOBALMFT_CONTACTS.put(fileKey, JSON.stringify(data, null, 2), {
      httpMetadata: { contentType: "application/json" },
    });

    // 4. Enviar correo de confirmación vía Brevo
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Global MFT",
          email: "contacto@globalmft.cobranext.pro",
        },
        to: [
          {
            email: data.email,
            name: data.first_name,
          },
        ],
        subject: "We have received your inquiry - Global MFT",
        htmlContent: `
          <h2>Hello ${data.first_name},</h2>
          <p>Thank you for contacting <strong>Global MFT</strong>.</p>
          <p>We have received your inquiry regarding <strong>${data.interest}</strong>.</p>
          <p>Our team will review your message and get back to you shortly.</p>
          <hr>
          <p style="font-size:12px;color:#666;">This is an automated confirmation. Please do not reply.</p>
        `,
      }),
    });

    // 5. Redirección final
    return Response.redirect(
      `${new URL(request.url).origin}/contact.html?status=success`,
      303,
    );
  } catch (err) {
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
}
