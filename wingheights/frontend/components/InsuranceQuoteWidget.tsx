'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InsuranceQuoteForm } from './InsuranceQuoteForm'
import { X, ShieldCheck } from 'lucide-react'

export default function InsuranceQuoteWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#1E2C6B] hover:bg-[#1E2C6B]/90 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        <ShieldCheck className="h-5 w-5" />
        <span>Get Insurance Quote</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="p-6">
              <InsuranceQuoteForm 
                title="Request an Insurance Quote"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}