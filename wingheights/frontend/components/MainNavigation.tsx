'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const organizedItems = useMemo(() => {
    const topLevelItems: NavigationItem[] = []
    const itemMap: Record<number, NavigationItem> = {}

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

  const renderNavItems = (navItems: NavigationItem[], level = 0) => {
    return navItems.map((item) => (
      <li key={item.id} className={cn("relative group", isMobile && "w-full")}>
        <div className="flex items-center">
          <Link
            href={getItemPath(item)}
            className={cn(
              "flex-grow py-2 px-2 lg:px-3 text-base lg:text-lg transition duration-300",
              isMobile ? "text-[#C4A484] hover:bg-[#152052]" : "text-white hover:text-[#C4A484]",
              pathname === getItemPath(item) && "bg-[#152052]",
              level > 0 && "pl-6 lg:pl-4"
            )}
            onClick={() => isMobile && setIsOpen(false)}
          >
            {item.title}
          </Link>
          {item.items && item.items.length > 0 && (
            <button
              onClick={() => toggleDropdown(item.id)}
              className={cn(
                "p-2 transition duration-300",
                isMobile ? "text-[#C4A484] hover:bg-[#152052]" : "text-white hover:text-[#C4A484]"
              )}
              aria-expanded={openDropdowns.includes(item.id)}
              aria-label={`Toggle ${item.title} submenu`}
            >
              <ChevronDown className={cn("h-5 w-5 transition-transform", openDropdowns.includes(item.id) && "rotate-180")} />
            </button>
          )}
        </div>
        {item.items && item.items.length > 0 && (
          <ul className={cn(
            "bg-[#1E2C6B] shadow-lg min-w-[250px] rounded-md overflow-hidden",
            isMobile 
              ? (openDropdowns.includes(item.id) ? "block" : "hidden") 
              : "hidden group-hover:block absolute left-0 top-full z-50"
          )}>
            {renderNavItems(item.items, level + 1)}
          </ul>
        )}
      </li>
    ))
  }

  return (
    <header className="bg-[#1E2C6B] text-white shadow-md sticky top-0 z-50">
      <div className="px-20 mx-auto md:px-10  py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <nav className="hidden lg:flex space-x-1">
            <ul className="flex space-x-2">
              {renderNavItems(organizedItems)}
            </ul>
          </nav>
          
          <button
            className="lg:hidden p-2 rounded-md hover:bg-[#152052] transition duration-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="w-6 h-6 sm:w-8 sm:h-8 text-[#C4A484]" />
            ) : (
              <Menu className="w-6 h-6 sm:w-8 sm:h-8 text-[#C4A484]" />
            )}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      <nav 
        className={cn(
          "lg:hidden border-t border-[#152052] transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[calc(100vh-4rem)] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="px-4 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {renderNavItems(organizedItems)}
        </ul>
      </nav>
    </header>
  )
}