'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { InsuranceQuoteForm } from '@/components/InsuranceQuoteForm'
import { Media, TwoColumnFormLayout } from '@/components/ContentComponents'

interface MediaItem {
  __component: string
  id: number
  caption: string | null
  media: {
    id: number
    name: string
    alternativeText: string | null
    width: number
    height: number
    url: string
  }
}

interface FormLayoutItem {
  __component: string
  id: number
  leftColumn: Array<{
    type: string
    level?: number
    children: Array<{
      text: string
      type: string
      bold?: boolean
    }>
  }>
  rightColumn: {
    id: number
    title: string
  }
}

interface GlobalContent {
  id: number
  documentId: string
  content: Array<MediaItem | FormLayoutItem>
}

export default function Home() {
  const [globalContent, setGlobalContent] = useState<GlobalContent | null>(null)

  useEffect(() => {
    const fetchGlobalContent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/global?populate[content][populate]=*`)
        const data = await response.json()
        setGlobalContent(data.data)
      } catch (error) {
        console.error('Error fetching global content:', error)
      }
    }

    fetchGlobalContent()
  }, [])

  if (!globalContent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#1E2C6B] text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main>
        <section className="bg-[#1E2C6B] text-white py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <h1 className="text-5xl font-bold mb-4">Wing Heights Ghana</h1>
              <p className="text-xl mb-8">Enabling <span className="text-[#C4A484]">#BetterFutures</span></p>
            </div>
            <div className="md:w-1/2 relative">
              <Image
                src="/Subject-removebg-preview.png"
                alt="Insurance scenarios illustration"
                width={600}
                height={300}
                className="mb-8"
              />
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-20 bg-white"
            style={{
              borderTopLeftRadius: "50% 100%",
              borderTopRightRadius: "50% 100%",
            }}
          ></div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            {globalContent.content.map((item, index) => {
              if (item.__component === 'shared.media') {
                const mediaItem = item as MediaItem
                return (
                  <Media 
                    className="border-none shadow-none  duration-300"
                    key={index} 
                    media={{
                      url: mediaItem.media.url,
                      alternativeText: mediaItem.media.alternativeText || undefined,
                      width: mediaItem.media.width,
                      height: mediaItem.media.height
                    }} 
                    caption={mediaItem.caption || undefined} 
                  />
                )
              }
              if (item.__component === 'forms.two-column-form-layout') {
                const formItem = item as FormLayoutItem
                return (
                  <Card className="bg-white border-none shadow-none   duration-300 p-2 rounded-lg">
                    <TwoColumnFormLayout
                      key={index}
                      leftColumn={formItem.leftColumn}
                      rightColumn={
                        <InsuranceQuoteForm title={formItem.rightColumn.title} />
                      }
                      className="text-[#1E2C6B]"
                    />
                  </Card>
                )
              }
              return null
            })}
          </div>
        </section>
      </main>
    </div>
  )
}