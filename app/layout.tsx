import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { LoadingProvider } from "@/lib/loading-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SIEDpro - Sistema Institucional Educativo Docente",
  description: "Plataforma de gestión académica, pedagógica y administrativa para docentes",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/android-icon-36x36.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/android-icon-36x36",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased ${_inter.className}`}>
        <AuthProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </AuthProvider>

        <Analytics />
      </body>
    </html>
  )
}
