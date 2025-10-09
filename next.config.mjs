/** @type {import('next').NextConfig} */
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const inferredBasePath = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}` : "";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? inferredBasePath;

const assetPrefix = basePath ? `${basePath}/` : undefined;

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  output: "export",
  basePath,
  assetPrefix
};

export default nextConfig;
