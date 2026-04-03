export async function onRequest(context) {
  const { request, env } = context;
    const gasUrl = new URL(env.GAS_URL);
    const requestUrl = new URL(request.url);
  
  const searchParams = requestUrl.searchParams;
  searchParams.forEach((value, key) => {
    gasUrl.searchParams.set(key, value);
  });

  return fetch(gasUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
}
