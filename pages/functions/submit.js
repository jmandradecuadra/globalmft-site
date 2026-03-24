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

    // 1. Verify Turnstile (Using environment variable)
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

    // 2. Save to R2
    const fileKey = `inquiries/${Date.now()}-${contactData.email}.json`;
    await env.CONTACTS_BUCKET.put(fileKey, JSON.stringify(contactData), {
      httpMetadata: { contentType: "application/json" },
    });

    // 3. Send Email via Brevo (Using environment variable)
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": env.BREVO_API_KEY, // Key is now safely pulled from Cloudflare
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Global MFT", email: "info@globalmft.cobranext.com" },
        to: [{ email: contactData.email, name: contactData.first_name }],
        subject: "We have received your inquiry - Global MFT",
        htmlContent: `<h2>Thank you ${contactData.first_name}!</h2><p>We received your request about ${contactData.interest}.</p>`,
      }),
    });

    return Response.redirect(
      `${new URL(request.url).origin}/contact.html?status=success`,
      303,
    );
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
