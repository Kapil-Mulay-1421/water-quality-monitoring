import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Water Quality Monitoring System',
  description: 'Monitor and visualize water quality measurements from distributed sensors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
