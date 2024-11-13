'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface NavigationItem {
  id: number
  label: string
  link: string
  order: number
}

interface NavigationSection {
  id: number
  title: string
  slug: string
  items: NavigationItem[]
}

interface NavigationProps {
  sections: NavigationSection[]
}

const NavigationItemComponent = ({ item }: { item: NavigationItem }) => {
  return (
    <div className="">
      <Link href={item.link} className="block py-2 px-4 text-gray-700 hover:bg-blue-50 transition duration-300 rounded-md">
        {item.label}
      </Link>
    </div>
  )
}

const NavigationSectionComponent = ({ section }: { section: NavigationSection }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Sort items once for performance
  const sortedItems = [...section.items].sort((a, b) => a.order - b.order)

  return (
    <li className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 px-4 text-gray-800 hover:bg-blue-100 transition duration-300 rounded-md"
      >
        {section.title}
        <span className="ml-2">
          {isOpen ? <FiChevronUp className="transition-transform" /> : <FiChevronDown className="transition-transform" />}
        </span>
      </button>
      {sortedItems.length > 0 && (
        <ul className={`${isOpen ? 'block' : 'hidden'} pl-4 md:absolute md:left-0 md:top-full md:pl-0 md:mt-1 bg-white md:shadow-lg md:min-w-[200px] md:rounded-md md:border border-gray-200`}>
          {sortedItems.map(item => (
            <NavigationItemComponent key={item.id} item={item} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function Navigation({ sections }: NavigationProps) {
  return (
    <nav className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg rounded-lg overflow-hidden">
      <ul className="flex flex-col md:flex-row md:space-x-4 p-4">
        {sections.map(section => (
          <NavigationSectionComponent key={section.id} section={section} />
        ))}
      </ul>
    </nav>
  )
}