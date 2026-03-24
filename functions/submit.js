export async function onRequestPost(context) {
  const { request, env } = context;
  const formData = await request.formData();

  // Captura el token generado por el widget en el HTML
  const token = formData.get("cf-turnstile-response");
  const ip = request.headers.get("CF-Connecting-IP");
  const SECRET_KEY = "0x4AAAAAACvYqIoHaCVKBvb4bfBQwyADvSM"; // Tu Secret Key

  // Validar con la API de Cloudflare
  const verifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${SECRET_KEY}&response=${token}&remoteip=${ip}`,
    },
  );

  const outcome = await verifyResponse.json();

  if (outcome.success) {
    // Si es humano, aquí procesas el envío (ej. enviar a base de datos o email)
    return new Response("¡Verificación exitosa! Mensaje enviado.", {
      status: 200,
    });
  } else {
    // Si falla la verificación
    return new Response(
      "Fallo en la verificación de seguridad. Intenta de nuevo.",
      { status: 403 },
    );
  }
}
