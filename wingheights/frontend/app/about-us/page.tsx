'use client'

import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import Image from 'next/image'

interface MediaBlock {
  __component: 'shared.media'
  id: number
  image: {
    data: {
      id: number
      
        url: string
        width: number
        height: number
        alternativeText: string
      
    }
  }
}

interface RichTextBlock {
  __component: 'shared.rich-text'
  id: number
  body: string
}

type Block = MediaBlock | RichTextBlock

interface PageData {
  id: number
  documentId: string
  title: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string | null
  blocks: Block[]
}

interface ApiResponse {
  data: PageData
  meta: any
}

export default function AboutPage() {
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mediaUrls, setMediaUrls] = useState<Record<number, string>>({})

  const fetchMediaById = async (imageId: number) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload/files/${imageId}`
      )
      const imageUrl = response.data.url
      const fullImageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${imageUrl}`
      console.log(fullImageUrl)
      return fullImageUrl
    } catch (error) {
      console.error('Error fetching image by ID:', error)
      throw error
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/about?populate=*`)
        
        setPageData(response.data.data)
        
        const mediaBlocks = response.data.data.blocks.filter(
          (block): block is MediaBlock => block.__component === 'shared.media'
        )
        const mediaUrlPromises = mediaBlocks.map(async (block) => {
          const url = await fetchMediaById(block.id)
          return { id: block.id, url }
        })
        const mediaUrlResults = await Promise.all(mediaUrlPromises)
        const mediaUrlMap = Object.fromEntries(
          mediaUrlResults.map(({ id, url }) => [id, url])
        )
        setMediaUrls(mediaUrlMap)

        setIsLoading(false)
      } catch (err) {
        setError('Failed to fetch page data')
        setIsLoading(false)
        console.error('Error fetching page data:', err)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
  }

  if (!pageData) {
    return <div className="container mx-auto px-4 py-8">No data available</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{pageData.title}</h1>
      <div className="prose max-w-none">
        {pageData.blocks.map((block, index) => {
          switch (block.__component) {
            case 'shared.media':
              const imageData = block.id
              const imageUrl = mediaUrls[block.id]
              return (
                <div key={index} className="mb-4">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={  'About Wing Heights'}
                      width={144}
                      height={144}
                      layout="responsive"
                    />
                  )}
                </div>
              )
            case 'shared.rich-text':
              return <ReactMarkdown key={index}>{block.body || ''}</ReactMarkdown>
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}