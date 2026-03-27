/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite el acceso a recursos de dev desde ngrok y cualquier otro túnel.
  // Agregá acá el dominio de tu túnel si cambia (ngrok lo rota en el plan free).
  allowedDevOrigins: process.env.NGROK_DOMAIN
    ? [process.env.NGROK_DOMAIN]
    : ['*.ngrok-free.app', '*.ngrok.io'],

  experimental: {
    serverActions: {
      allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
        : [],
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // fotos de perfil de Google
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/_next/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;