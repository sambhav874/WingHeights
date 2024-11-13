'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Logo from './Logo'

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

interface MainNavigationProps {
  items: NavigationItem[]
}

export function MainNavigation({ items }: MainNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<number[]>([])
  const pathname = usePathname()

  const organizedItems = useMemo(() => {
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

  const renderNavItems = (navItems: NavigationItem[], isMobile = false) => {
    return navItems.map((item) => (
      <li key={item.id} className={cn("relative group", isMobile && "w-full")}>
        <div className="flex items-center">
          <Link
            href={getItemPath(item)}
            className={cn(
              "flex-grow py-2 px-4 transition duration-300",
              isMobile ? "text-[#C4A484] hover:bg-[#1E2C6B]/90" : "text-white hover:text-[#C4A484]",
              pathname === getItemPath(item) && "bg-[#1E2C6B]/90"
            )}
          >
            {item.title}
          </Link>
          {item.items && item.items.length > 0 && (
            <button
              onClick={() => toggleDropdown(item.id)}
              className={cn(
                "p-2 transition duration-300",
                isMobile ? "text-[#C4A484] hover:bg-[#1E2C6B]/90" : "text-white hover:text-[#C4A484]"
              )}
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdowns.includes(item.id) && "rotate-180")} />
            </button>
          )}
        </div>
        {item.items && item.items.length > 0 && (
          <ul className={cn(
            "bg-[#1E2C6B] shadow-md min-w-[200px] rounded-md overflow-hidden",
            isMobile ? (openDropdowns.includes(item.id) ? "block" : "hidden") : "hidden group-hover:block absolute left-0 top-full"
          )}>
            {renderNavItems(item.items, isMobile)}
          </ul>
        )}
      </li>
    ))
  }

  return (
    <header className="bg-[#1E2C6B] text-white z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <nav className="hidden md:flex space-x-6">
            <ul className="flex space-x-6">
              {renderNavItems(organizedItems)}
            </ul>
          </nav>
          
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle mobile menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-[#C4A484]" />
            ) : (
              <Menu className="w-6 h-6 text-[#C4A484]" />
            )}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      <nav className={cn("md:hidden", isOpen ? "block" : "hidden")}>
        <ul className="px-2 pt-2 pb-4 space-y-1">
          {renderNavItems(organizedItems, true)}
        </ul>
      </nav>
    </header>
  )
}