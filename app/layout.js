// Import the global stylesheet so styles apply across the app
import "./global.css"; // importing our global CSS for the entire app

// SEO metadata for the site
export const metadata = {
  title: "TheMujdii | CyberPilot", // page title shown in the browser/tab and SEO
  description: "Developer • CTF Player • Ultralight Pilot • Music Addict", // summary for search/social
  icons: {
    icon: "/favicon.gif",
    shortcut: "/favicon.gif",
  },
};

// Ensure proper scaling on mobile devices without affecting desktop
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Root layout wrapper for Next.js App Router
export default function RootLayout({ children }) {
  // Return the base HTML document structure
  return (
    <html lang="en"> {/* set document language for accessibility/SEO */}
      <head /> {/* Next.js will inject head elements here */}
      <body>{children}</body> {/* render all routed pages here */}
    </html>
  );
}
