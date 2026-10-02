/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // react-leaflet ships ESM that Next needs to transpile
  transpilePackages: ["react-leaflet", "@react-leaflet/core"],
};

export default nextConfig;
