export async function onRequest(context) {
  // Ambil URL GAS dari environment variable yang nanti kita set di dashboard
  const gasUrl = context.env.GAS_URL;

  // Forward request ke Google Apps Script
  const response = await fetch(gasUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body
  });

  return response;
}
