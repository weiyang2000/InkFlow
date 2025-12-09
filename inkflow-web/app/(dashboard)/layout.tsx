'use client'

import { Sidebar } from '@/components/layout'
import { useParams } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const novelId = params?.novelId as string | undefined

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar novelId={novelId} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
