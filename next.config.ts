/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    // Ignorer les erreurs ESLint pendant le build (temporaire)
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build (temporaire)
    ignoreBuildErrors: false,
  },
  // Configuration pour améliorer les performances en production
  experimental: {
    optimizeCss: true,
  },
  // Configuration pour les variables d'environnement
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig