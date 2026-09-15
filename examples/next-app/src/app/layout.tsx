import type { ReactNode } from "react";
import { BannerControls } from "./message";
export default function Layout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BannerControls />
        {children}
      </body>
    </html>
  );
}
