export const metadata = {
  title: 'Tiny Library',
  description: 'Find your next favourite book.',
}
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
