export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    // Captura de datos del formulario
    const contactData = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone") || "N/A",
      interest: formData.get("interest"),
      message: formData.get("message"),
      date: new Date().toISOString(),
    };

    // 1. Verificación de seguridad Turnstile
    const token = formData.get("cf-turnstile-response");
    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=0x4AAAAAACvYqIoHaCVKBvb4bfBQwyADvSM&response=${token}`,
      },
    );

    const outcome = await verifyResponse.json();
    if (!outcome.success) {
      return new Response(
        "Security check failed. Please refresh and try again.",
        { status: 403 },
      );
    }

    // 2. Guardar en R2 (Base de datos de objetos)
    // Asegúrate de que el bucket esté vinculado como CONTACTS_BUCKET en Cloudflare
    const fileKey = `inquiries/${Date.now()}-${contactData.email}.json`;
    await env.CONTACTS_BUCKET.put(fileKey, JSON.stringify(contactData), {
      httpMetadata: { contentType: "application/json" },
    });

    // 3. Enviar Correo vía API de Brevo
    const BREVO_API_KEY =
      "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";

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Global MFT", email: "info@globalmft.cobranext.com" },
        to: [{ email: contactData.email, name: contactData.first_name }],
        subject: "Confirmation: We have received your inquiry - Global MFT",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #E84E1B;">Thank you for reaching out, ${contactData.first_name}!</h2>
            <p>We have successfully received your inquiry regarding <strong>${contactData.interest}</strong>.</p>
            <p>Our team is currently reviewing your message and one of our consultants will contact you shortly to discuss how we can support <strong>${contactData.company}</strong>.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p style="margin: 0; font-size: 13px; color: #666;"><strong>Summary of your request:</strong></p>
                <p style="margin: 5px 0; font-size: 14px;">${contactData.message.substring(0, 100)}...</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 11px; color: #999; text-align: center;">This is an automated confirmation from Global MFT.</p>
          </div>
        `,
      }),
    });

    // 4. Éxito: Redirigir con parámetro status
    return Response.redirect(
      `${new URL(request.url).origin}/contact.html?status=success`,
      303,
    );
  } catch (err) {
    return new Response(`Error procesando la solicitud: ${err.message}`, {
      status: 500,
    });
  }
}
