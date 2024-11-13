'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  id: number
  title: string
  path: string
  items?: NavigationItem[]
  type: string
  parent?: {
    id: number
  }
  related?: {
    data: {
      slug: string
    }
  }
}

interface FooterProps {
  items: NavigationItem[] | null
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
]

export function Footer({ items }: FooterProps) {
  const [openDropdowns, setOpenDropdowns] = useState<number[]>([])
  const pathname = usePathname()

  const organizedItems = useMemo(() => {
    if (!items) return []

    const topLevelItems: NavigationItem[] = []
    const itemMap: Record<number, NavigationItem> = {}

    const homeItem: NavigationItem = {
      id: 0,
      title: "Home",
      path: "/",
      type: "INTERNAL"
    }
    topLevelItems.push(homeItem)

    items.forEach(item => {
      itemMap[item.id] = { ...item, items: [] }
    })

    items.forEach(item => {
      if (item.parent) {
        const parentItem = itemMap[item.parent.id]
        if (parentItem) {
          parentItem.items = parentItem.items || []
          const updatedItem = {
            ...itemMap[item.id],
            path: `${parentItem.path}/${item.path}`
          }
          parentItem.items.push(updatedItem)
          itemMap[item.id] = updatedItem
        }
      } else {
        topLevelItems.push(itemMap[item.id])
      }
    })

    return topLevelItems
  }, [items])

  const toggleDropdown = (id: number) => {
    setOpenDropdowns(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getItemPath = (item: NavigationItem) => {
    return item.path === "/" ? "/" : item.related?.data?.slug || item.path
  }

  const renderNavItems = (navItems: NavigationItem[]) => {
    return navItems.map((item) => (
      <li key={item.id} className="relative group">
        <div className="flex items-center">
          <Link
            href={getItemPath(item)}
            className={cn(
              "flex-grow py-2 transition duration-300 hover:text-[#C4A484]",
              pathname === getItemPath(item) && "text-[#C4A484]"
            )}
          >
            {item.title}
          </Link>
          {item.items && item.items.length > 0 && (
            <button
              onClick={() => toggleDropdown(item.id)}
              className="p-2 transition duration-300 hover:text-[#C4A484]"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdowns.includes(item.id) && "rotate-180")} />
            </button>
          )}
        </div>
        {item.items && item.items.length > 0 && (
          <ul className={cn(
            "pl-4 space-y-2",
            openDropdowns.includes(item.id) ? "block" : "hidden"
          )}>
            {renderNavItems(item.items)}
          </ul>
        )}
      </li>
    ))
  }

  return (
    <footer className="bg-[#1E2C6B] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Wing Heights Ghana</h2>
            <p className="mb-4">Enabling #BetterFutures</p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C4A484] transition-colors"
                >
                  <link.icon className="h-6 w-6" />
                  <span className="sr-only">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {renderNavItems(organizedItems)}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <a href="mailto:wingheightslimited@gmail.com" className="hover:text-[#C4A484] transition-colors">
                  wingheightslimited@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <a href="tel:+233530900124" className="hover:text-[#C4A484] transition-colors">
                  +233 530 900 124 
                </a>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <a href="https://wa.me/233530900124" className="hover:text-[#C4A484] transition-colors">
                  +233 530 900 124
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                <span>6th Avenue May's Plaza, Community 8, Tumatu Lane, Tema, Greater Accra
                P.O Box BT 371 Tema, GA/R</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#C4A484]/20 text-center">
          <p>&copy; {new Date().getFullYear()} Wing Heights Ghana. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}