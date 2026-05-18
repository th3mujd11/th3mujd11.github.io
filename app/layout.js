import "./global.css";

// SEO metadata for the site
export const metadata = {
  title: "TheMujdii | CyberPilot", 
  description: "Developer • CTF Player • Ultralight Pilot • Music Addict", 
  icons: {
    icon: "/favicon.gif",
    shortcut: "/favicon.gif",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"> {/* set document language for accessibility/SEO */}
      <head><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "de5af8d6d8814942a49aee8b99dbd19f"}'></script></head> {/* Next.js will inject head elements here */}
      <body>{children}</body> {/* render all routed pages here */}
    </html>
  );
}