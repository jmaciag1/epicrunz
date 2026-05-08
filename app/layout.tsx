import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EpicRunz — Find Races, Connect with Runners',
  description: 'Discover 5Ks to ultramarathons near you and connect with the running community.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950`}>
        <Nav />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
