export async function onRequestPost(context) {
  const { request, env } = context;

  // Detect language from the Referer header to redirect correctly after submit
  const referer = request.headers.get("referer") || "";
  const isES = referer.includes("/es/") || referer.includes("/pages/es/");
  const origin = new URL(request.url).origin;
  const successRedirect = isES
    ? `${origin}/pages/es/contact.html?status=success`
    : `${origin}/pages/contact.html?status=success`;
  const errorRedirect = isES
    ? `${origin}/pages/es/contact.html?status=error`
    : `${origin}/pages/contact.html?status=error`;

  try {
    const formData = await request.formData();

    // 1. Form data
    const data = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone") || "N/A",
      interest: formData.get("interest"),
      message: formData.get("message"),
      lang: isES ? "es" : "en",
      timestamp: new Date().toISOString(),
    };

    // Basic field validation (belt-and-suspenders beyond HTML required)
    if (!data.first_name || !data.email || !data.message || !data.interest) {
      return Response.redirect(errorRedirect, 303);
    }

    // 2. Turnstile verification
    const token = formData.get("cf-turnstile-response");
    if (!token) {
      return Response.redirect(errorRedirect, 303);
    }

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
      console.error("Turnstile failed:", outcome["error-codes"]);
      return new Response("Security check failed.", { status: 403 });
    }

    // 3. Save to R2 — GLOBALMFT_CONTACTS binding must be declared in wrangler.toml
    //    [[r2_buckets]]
    //    binding = "GLOBALMFT_CONTACTS"
    //    bucket_name = "your-bucket-name"
    if (!env.GLOBALMFT_CONTACTS) {
      console.error("R2 binding GLOBALMFT_CONTACTS is not configured.");
      return Response.redirect(errorRedirect, 303);
    }

    const safeEmail = data.email.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const fileKey = `contacts-requests/${Date.now()}_${safeEmail}.json`;

    try {
      await env.GLOBALMFT_CONTACTS.put(fileKey, JSON.stringify(data, null, 2), {
        httpMetadata: { contentType: "application/json" },
      });
    } catch (r2Err) {
      // Log but don't block — still send the email even if R2 write fails
      console.error("R2 write failed:", r2Err.message);
    }

    // 4. Send confirmation email via Brevo
    if (!env.BREVO_API_KEY) {
      console.error("BREVO_API_KEY is not configured.");
    } else {
      const emailBody = isES
        ? {
            subject: "Hemos recibido su consulta — Global MFT",
            htmlContent: `
              <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e;">
                <div style="background:#0D1B2E;padding:28px 32px;border-radius:8px 8px 0 0;">
                  <h1 style="color:#F4F8FF;font-size:22px;margin:0;">Global <span style="color:#E84E1B;">MFT</span></h1>
                </div>
                <div style="background:#f9f9fb;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
                  <h2 style="font-size:20px;color:#0D1B2E;margin:0 0 16px;">Hola ${data.first_name},</h2>
                  <p style="color:#374151;line-height:1.7;">Hemos recibido su consulta sobre <strong>${data.interest}</strong>. Nuestro equipo la revisará y se pondrá en contacto con usted a la brevedad.</p>
                  <div style="margin:24px 0;padding:16px;background:#fff;border-left:3px solid #E84E1B;border-radius:0 4px 4px 0;">
                    <p style="margin:0;font-size:13px;color:#6b7280;"><strong>Empresa:</strong> ${data.company}</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#6b7280;"><strong>Área de interés:</strong> ${data.interest}</p>
                  </div>
                  <p style="color:#374151;line-height:1.7;">Tiempos de respuesta: consultas generales dentro de 1 día hábil.</p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                  <p style="font-size:11px;color:#9ca3af;">Este es un correo automático de confirmación. Por favor no responda a este mensaje.</p>
                </div>
              </div>
            `,
          }
        : {
            subject: "We received your inquiry — Global MFT",
            htmlContent: `
              <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e;">
                <div style="background:#0D1B2E;padding:28px 32px;border-radius:8px 8px 0 0;">
                  <h1 style="color:#F4F8FF;font-size:22px;margin:0;">Global <span style="color:#E84E1B;">MFT</span></h1>
                </div>
                <div style="background:#f9f9fb;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
                  <h2 style="font-size:20px;color:#0D1B2E;margin:0 0 16px;">Hello ${data.first_name},</h2>
                  <p style="color:#374151;line-height:1.7;">Thank you for contacting <strong>Global MFT</strong>. We have received your inquiry regarding <strong>${data.interest}</strong> and our team will get back to you shortly.</p>
                  <div style="margin:24px 0;padding:16px;background:#fff;border-left:3px solid #E84E1B;border-radius:0 4px 4px 0;">
                    <p style="margin:0;font-size:13px;color:#6b7280;"><strong>Company:</strong> ${data.company}</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#6b7280;"><strong>Area of interest:</strong> ${data.interest}</p>
                  </div>
                  <p style="color:#374151;line-height:1.7;">General inquiries are responded to within 1 business day.</p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                  <p style="font-size:11px;color:#9ca3af;">This is an automated confirmation. Please do not reply to this email.</p>
                </div>
              </div>
            `,
          };

      try {
        const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
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
            to: [{ email: data.email, name: data.first_name }],
            // BCC to internal team so every submission is also emailed internally
            bcc: [
              {
                email: "info@globalmft.cobranext.pro",
                name: "Global MFT Team",
              },
            ],
            subject: emailBody.subject,
            htmlContent: emailBody.htmlContent,
          }),
        });

        if (!brevoRes.ok) {
          const errText = await brevoRes.text();
          console.error("Brevo API error:", brevoRes.status, errText);
          // Don't redirect to error — R2 save succeeded, just log the email failure
        }
      } catch (brevoErr) {
        console.error("Brevo fetch failed:", brevoErr.message);
      }
    }

    // 5. Success redirect
    return Response.redirect(successRedirect, 303);
  } catch (err) {
    console.error("Unhandled error in submit handler:", err.message);
    return Response.redirect(errorRedirect, 303);
  }
}
