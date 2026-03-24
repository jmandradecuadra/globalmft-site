// Archivo: pages/functions/submit.js
// Función: Procesar formulario de contacto, validar Turnstile, guardar en R2 y enviar email vía Brevo.
// Versión: 1.2.1

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    
    // 1. Recopilación de datos del formulario
    const contactData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        company: formData.get('company'),
        email: formData.get('email'),
        phone: formData.get('phone') || 'N/A',
        interest: formData.get('interest'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };

    // 2. Verificación de seguridad Turnstile
    const token = formData.get('cf-turnstile-response');
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${env.TURNSTILE_SECRET_KEY}&response=${token}`
    });

    const outcome = await verifyResponse.json();
    if (!outcome.success) {
      return new Response('Security check failed. Please refresh and try again.', { status: 403 });
    }

    // 3. Escritura en R2 (Base de datos)
    // Se utiliza el binding CONTACTS_BUCKET configurado en el panel de Cloudflare
    const fileKey = `inquiries/${Date.now()}-${contactData.email}.json`;
    
    try {
      await env.CONTACTS_BUCKET.put(fileKey, JSON.stringify(contactData), {
        httpMetadata: { contentType: 'application/json' }
      });
    } catch (r2Error) {
      console.error("Error al escribir en R2:", r2Error.message);
      throw new Error("No se pudo guardar el contacto en la base de datos R2.");
    }

    // 4. Envío de Email vía Brevo (dominio .pro verificado)
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': env.BREVO_API_KEY, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "Global MFT", email: "info@globalmft.cobranext.pro" },
        to: [{ email: contactData.email, name: contactData.first_name }],
        subject: "We have received your inquiry - Global MFT",
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #E84E1B;">Thank you, ${contactData.first_name}!</h2>
            <p>We have received your request regarding <b>${contactData.interest}</b>.</p>
            <p>Our team will review your message and contact you shortly.</p>
          </div>
        `
      })
    });

    if (!brevoResponse.ok) {
      const errorBody = await brevoResponse.text();
      throw new Error(`Error de Brevo: ${brevoResponse.status} - ${errorBody}`);
    }

    // 5. Redirección final con éxito
    return Response.redirect(`${new URL(request.url).origin}/contact.html?status=success`, 303);

  } catch (err) {
    return new Response(`Error en el servidor: ${err.message}`, { status: 500 });
  }
}
}