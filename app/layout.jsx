import "./globals.css";
import "@smastrom/react-rating/style.css";

import { Analytics } from "@vercel/analytics/react";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>CRAWLS - Discover Food</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body className="">
        {children} <Analytics />
      </body>
    </html>
  );
}
