import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InkFlow - 登录',
  description: 'AI 驱动的小说创作平台',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  )
}
