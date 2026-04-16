import type { Metadata } from 'next'
import { DM_Sans, Space_Mono, Bebas_Neue } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono' })
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' })

export const metadata: Metadata = {
  title: 'StudyGuy — AI Study Guides',
  description: 'Upload any document and get an AI-generated study guide instantly.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceMono.variable} ${bebasNeue.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
