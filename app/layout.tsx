import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nukul Talwar Portfolio",
  description: "Software Engineer & Frontend Developer - Arc Reactor 3D Interactive Portfolio",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="claude:viewport-fit-sides" content="cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700&family=Barlow:wght@400;500;600&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
        <script src="/vendor/three/three.min.js"></script>
        <script src="/vendor/three/CopyShader.js"></script>
        <script src="/vendor/three/EffectComposer.js"></script>
        <script src="/vendor/three/RenderPass.js"></script>
        <script src="/vendor/three/ShaderPass.js"></script>
        <script src="/vendor/three/LuminosityHighPassShader.js"></script>
        <script src="/vendor/three/UnrealBloomPass.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
