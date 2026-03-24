export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    
    // 1. Captura de datos del formulario
    const contactData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        company: formData.get('company'),
        email: formData.get('email'),
        phone: formData.get('phone') || 'N/A',
        interest: formData.get('interest'),
        message: formData.get('message'),
        date: new Date().toISOString()
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

    // 3. Guardar en R2 (Base de datos de objetos)
    const fileKey = `inquiries/${Date.now()}-${contactData.email}.json`;
    await env.CONTACTS_BUCKET.put(fileKey, JSON.stringify(contactData), {
      httpMetadata: { contentType: 'application/json' }
    });

    // 4. Enviar Correo vía API de Brevo
    // El remitente DEBE ser .pro para coincidir con tu dominio verificado
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
        subject: "Confirmation: We have received your inquiry - Global MFT",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #E84E1B;">Thank you for reaching out, ${contactData.first_name}!</h2>
            <p>We have successfully received your inquiry regarding <strong>${contactData.interest}</strong>.</p>
            <p>Our team is currently reviewing your message and one of our consultants will contact you shortly to discuss how we can support <strong>${contactData.company}</strong>.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 11px; color: #999; text-align: center;">This is an automated confirmation from Global MFT.</p>
          </div>
        `
      })
    });

    if (!brevoResponse.ok) {
      const errorBody = await brevoResponse.text();
      throw new Error(`Brevo API Error: ${brevoResponse.status} - ${errorBody}`);
    }

    // 5. Éxito: Redirigir con parámetro status
    return Response.redirect(`${new URL(request.url).origin}/contact.html?status=success`, 303);

  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
}