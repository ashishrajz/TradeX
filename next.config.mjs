/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
      remotePatterns: [
        // Clerk user avatars (these vary by region, so allow all Clerk subdomains)
        {
          protocol: 'https',
          hostname: '**.clerk.com',
        },
        {
          protocol: 'https',
          hostname: '**.clerk.dev',
        },
  
        // GNews or news API images
        {
          protocol: 'https',
          hostname: '**.gnews.io',
        },
        {
          protocol: 'https',
          hostname: '**.googleusercontent.com',
        },
        {
          protocol: 'https',
          hostname: '**.bbc.co.uk',
        },
        {
          protocol: 'https',
          hostname: '**.cnn.com',
        },
        {
          protocol: 'https',
          hostname: '**.reuters.com',
        },
  
        // Crypto sources
        {
          protocol: 'https',
          hostname: '**.coingecko.com',
        },
        {
          protocol: 'https',
          hostname: '**.binance.com',
        },
        {
          protocol: 'https',
          hostname: '**.coinmarketcap.com',
        },
  
        // Optional: fallback to allow some generic CDN images
        {
          protocol: 'https',
          hostname: '**.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: '**.cloudflare.com',
        },
      ],
    },
  };
  
  export default nextConfig;
  
