import React from 'react'
import Head from 'next/head'
import UserTopBar from '@/components/UserTopBar'
import Footer from '@/components/Footer'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen page-watermark">
        <UserTopBar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}

export default MainLayout