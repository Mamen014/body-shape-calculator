// app/layout.js
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata = {
  title: 'Body Shape Calculator',
  description: 'Track and calculate body shape',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
