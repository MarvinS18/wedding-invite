export default function handler(request) {
  const host = request.headers.get('host');

  // Se la richiesta viene dal dominio vercel.app, restituisci 404
  if (host && host.includes('wedding-site-karlandreichelle.vercel.app')) {
    return new Response('Not Found', { status: 404 });
  }

  // Altrimenti, lascia passare normalmente (null permette il passaggio)
  return null;
}

export const config = {
  runtime: 'edge',
};
