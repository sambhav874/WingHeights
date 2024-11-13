'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavigationItem } from '@/types'

interface NavbarProps {
  navigation: NavigationItem[]
}

const NavItem = ({ item, isChild = false }: { item: NavigationItem; isChild?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const hasChildren = item.items && item.items.length > 0

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <li className={`relative ${isChild ? 'ml-4' : ''}`}>
      <div className="flex items-center">
        <Link
          href={item.path}
          className={`block py-2 px-4 ${
            pathname === item.path ? 'text-purple-500' : 'text-gray-700 hover:text-purple-500'
          }`}
        >
          {item.title}
        </Link>
        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-700 hover:text-purple-500"
          >
            {isOpen ? '▲' : '▼'}
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <ul className="pl-4">
          {item.items!.map((childItem) => (
            <NavItem key={childItem.id} item={childItem} isChild />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function Navbar({ navigation }: NavbarProps) {
  return (
    <nav className="bg-white shadow-md">
      <ul className="container mx-auto px-4 py-2 flex flex-wrap">
        {navigation.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  )
}