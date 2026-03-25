// Archivo: pages/functions/submit.js
// Función: Procesar formulario de contacto, validar Turnstile, guardar en R2 y enviar email vía Brevo.
// Versión: 1.3.0 — Multilenguaje + Redirección dinámica

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    // 1. Recopilación de datos del formulario
    const contactData = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone") || "N/A",
      interest: formData.get("interest"),
      message: formData.get("message"),
      timestamp: new Date().toISOString(),
    };

    // 2. Verificación Turnstile
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
      return new Response(
        "Security check failed. Please refresh and try again.",
        {
          status: 403,
        },
      );
    }

    // 3. Escritura en R2
    const fileKey = `inquiries/${Date.now()}-${contactData.email}.json`;

    try {
      await env.CONTACTS_BUCKET.put(fileKey, JSON.stringify(contactData), {
        httpMetadata: { contentType: "application/json" },
      });
    } catch (r2Error) {
      console.error("Error R2:", r2Error.message);
      throw new Error("Database connection failed (R2).");
    }

    // 4. Envío de Email vía Brevo
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Global MFT", email: "info@globalmft.cobranext.pro" },
        to: [{ email: contactData.email, name: contactData.first_name }],
        subject: "We have received your inquiry - Global MFT",
        htmlContent: `<h2>Thank you ${contactData.first_name}</h2><p>We received your request for ${contactData.interest}.</p>`,
      }),
    });

    // 5. Redirección dinámica multilenguaje
    const referer = request.headers.get("referer");

    if (referer) {
      const url = new URL(referer);
      url.searchParams.set("status", "success");
      return Response.redirect(url.toString(), 303);
    }

    // Fallback (por si no hay referer)
    return Response.redirect("/contact.html?status=success", 303);
  } catch (err) {
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
}
