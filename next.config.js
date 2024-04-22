/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        // Enables the styled-components SWC transform
        styledComponents: true
      },
      images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '127.0.0.1',
            port: '54321',
            pathname: '/storage/v1/object/public/**',
          },
          {
            protocol: 'http',
            hostname: '127.0.0.1',
            port: '54321',
            pathname: '/storage/v1/object/sign/**',
          },
          {
            protocol: 'https',
            hostname: 'wamvifcpefpjqfjxrcqf.supabase.co',
            pathname: '/storage/v1/object/public/**',
          },
          {
            protocol: 'https',
            hostname: 'wamvifcpefpjqfjxrcqf.supabase.co',
            pathname: '/storage/v1/object/sign/**',
          },
        ],
      },
      experimental: {
        serverActions: {
          bodySizeLimit: '4mb',
        },
      },
};

module.exports = nextConfig;
