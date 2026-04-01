// src/components/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Clock, MessageSquare, Users,
  ShieldCheck, FileText, ScrollText, Server, ChevronRight
} from 'lucide-react'

const nav = [
  {
    section: 'Core',
    items: [
      { label: 'Dashboard',    href: '/',           icon: LayoutDashboard },
      { label: 'EHR Events',   href: '/events',     icon: Clock,          badge: '12' },
      { label: 'Messages',     href: '/messages',   icon: MessageSquare,  badgeRed: '3' },
      { label: 'Residents',    href: '/residents',  icon: Users },
    ]
  },
  {
    section: 'Compliance',
    items: [
      { label: 'Consent manager',      href: '/consent',  icon: ShieldCheck,  badgeAmber: '2' },
      { label: 'Data subject rights',  href: '/dsr',      icon: FileText },
      { label: 'Audit log',            href: '/audit',    icon: ScrollText },
    ]
  },
  {
    section: 'Infrastructure',
    items: [
      { label: 'Subprocessors & BAA',  href: '/infra',    icon: Server },
    ]
  },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">CB Messaging</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Sunrise SNF</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2">
        {nav.map(({ section, items }) => (
          <div key={section} className="mb-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest px-2 py-2">{section}</p>
            {items.map(({ label, href, icon: Icon, ...rest }: any) => {
              const { badge, badgeRed, badgeAmber } = rest
              const active = path === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] mb-0.5 transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-600 font-medium'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="text-[10px] font-medium bg-brand-400 text-white rounded-full px-1.5 py-0.5">{badge}</span>
                  )}
                  {badgeRed && (
                    <span className="text-[10px] font-medium bg-red-500 text-white rounded-full px-1.5 py-0.5">{badgeRed}</span>
                  )}
                  {badgeAmber && (
                    <span className="text-[10px] font-medium bg-amber-500 text-white rounded-full px-1.5 py-0.5">{badgeAmber}</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center text-[10px] font-medium text-brand-600">SM</div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium truncate">Sarah Mitchell</p>
            <p className="text-[10px] text-gray-400">Admin</p>
          </div>
          <ChevronRight className="w-3 h-3 text-gray-300" />
        </div>
      </div>
    </aside>
  )
}
