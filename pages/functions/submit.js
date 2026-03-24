export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

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

    // 1. Verificación de Turnstile
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

    // 2. Guardar en R2
    const fileKey = `inquiries/${Date.now()}-${contactData.email}.json`;
    await env.CONTACTS_BUCKET.put(fileKey, JSON.stringify(contactData), {
      httpMetadata: { contentType: "application/json" },
    });

    // 3. Enviar Correo vía Brevo
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        // ASEGÚRATE QUE ESTE EMAIL SEA EL MISMO QUE VERIFICASTE EN BREVO
        sender: { name: "Global MFT", email: "info@globalmft.cobranext.pro" },
        to: [{ email: contactData.email, name: contactData.first_name }],
        subject: "We have received your inquiry - Global MFT",
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #E84E1B;">Thank you, ${contactData.first_name}!</h2>
            <p>We have successfully received your request for <b>${contactData.interest}</b>.</p>
            <p>Our team will contact you shortly to discuss how we can support <b>${contactData.company}</b>.</p>
            <hr style="border:none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 11px; color: #999;">Global MFT | Technology Consulting</p>
          </div>
        `,
      }),
    });

    // Si Brevo devuelve error, lo lanzamos para verlo en los logs de Cloudflare
    if (!brevoResponse.ok) {
      const errorBody = await brevoResponse.text();
      throw new Error(
        `Brevo API Error: ${brevoResponse.status} - ${errorBody}`,
      );
    }

    return Response.redirect(
      `${new URL(request.url).origin}/contact.html?status=success`,
      303,
    );
  } catch (err) {
    // Esto mostrará el error en la pantalla si algo falla (solo para debug)
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
