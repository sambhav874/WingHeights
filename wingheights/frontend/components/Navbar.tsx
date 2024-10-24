'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    router.push('/')
  }

  return (
    <header className="bg-purple-900 text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Wing Heights
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link href="/general-insurance" className="hover:text-purple-200">
            General Insurance
          </Link>
          <Link href="/life-insurance" className="hover:text-purple-200">
            Life Insurance
          </Link>
          <Link href="/about-us" className="hover:text-purple-200">
            About Us
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="hover:text-purple-200 flex items-center">
                <User className="mr-1" size={18} />
                Profile
              </Link>
              <Button
                variant="ghost"
                className="text-white hover:bg-purple-800"
                onClick={handleLogout}
              >
                <LogOut className="mr-1" size={18} />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-purple-200">
                Login
              </Link>
              <Link href="/register" className="hover:text-purple-200">
                Register
              </Link>
            </>
          )}
          <Button variant="outline" className="text-black border-white hover:bg-purple-800">
            Contact Us
          </Button>
          
          <Search className="w-6 h-6" />
        </div>
      </div>
    </header>
  )
}

export default Navbar;