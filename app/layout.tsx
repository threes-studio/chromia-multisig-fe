import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import "flatpickr/dist/themes/light.css";
import DirectionProvider from "@/provider/direction.provider";
import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import type { Metadata } from "next";
import { WagmiProvider } from "wagmi";
import { config } from "@/config/wagmi";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <WagmiProvider config={config}>
        <TanstackProvider>
          <Providers>
            <DirectionProvider>
              <DashBoardLayoutProvider>
                {children}
              </DashBoardLayoutProvider>
            </DirectionProvider>
          </Providers>
        </TanstackProvider>
      </WagmiProvider>
    </html>
  );
}
