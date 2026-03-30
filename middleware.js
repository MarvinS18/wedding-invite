export default function middleware(request) {
  const host = request.headers.get('host');

  // Se la richiesta viene dal dominio vercel.app, restituisci 404
  if (host && host.includes('vercel.app')) {
    return new Response('Not Found', { status: 404 });
  }

  // Altrimenti, lascia passare la richiesta normalmente
  return null;
}

export const config = {
  matcher: ['/:path*'],
};
