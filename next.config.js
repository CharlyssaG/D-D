/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      // Add your Supabase project URL here when ready
      // e.g., 'yoursupabseproject.supabase.co'
    ],
  },
}

module.exports = nextConfig
