'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import { InsuranceQuoteForm } from './InsuranceQuoteForm'

interface QuoteProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  author?: string
}

interface HeadBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  smallDescription: string
}

interface MediaProps extends React.HTMLAttributes<HTMLDivElement> {
  media: {
    url: string
    alternativeText?: string
    width: number
    height: number
  }
  caption?: string
}

interface RichTextProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string
}

interface TwoColumnLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  leftColumn: string | any[]
  rightColumn: string | any[]
}

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  files: Array<{
    id: number
    url: string
    alternativeText?: string
    width: number
    height: number
  }>
}

interface TextItem {
  text: string
  bold?: boolean
  italic?: boolean
  strikethrough?: boolean
  underline?: boolean
  isList?: boolean
}

interface TwoColumnFormLayoutProps {
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
    title: string
  } | React.ReactNode
  className?: string
}

interface SEOProps {
  metaTitle: string
  metaDescription: string
}

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export function Quote({ text, author, className, ...props }: QuoteProps) {
  return (
    <Card className={cn("my-8 p-6 bg-[#1E2C6B]/10", className)} {...props}>
      <blockquote className="relative">
        <span className="absolute top-0 left-0 text-6xl text-[#1E2C6B]/20">"</span>
        <p className="italic text-lg text-[#1E2C6B] pt-8 px-8">{text}</p>
        {author && (
          <footer className="text-right mt-4 text-[#C4A484] font-medium">
            — {author}
          </footer>
        )}
      </blockquote>
    </Card>
  )
}

export function HeadBanner({ title, smallDescription, className, ...props }: HeadBannerProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)} {...props}>
      <div 
        className="w-full py-16 md:py-24 lg:py-32"
        style={{ 
          background: 'linear-gradient(135deg, #1E2C6B 0%, #3B4D7D 100%)'
        }}
      >
        <div className="mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {title}
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              {smallDescription}
            </p>
          </div>
          <div className="md:w-1/2 relative">
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-20 bg-white"
        style={{
          borderTopLeftRadius: "50% 100%",
          borderTopRightRadius: "50% 100%",
        }}
      ></div>
    </div>
  )
}

export function Media({ media, caption, className, ...props }: MediaProps) {
  const [isError, setIsError] = useState(false)

  if (!media?.url) {
    return null
  }

  const imageUrl = media.url.startsWith('http') 
    ? media.url 
    : `${API_URL}${media.url}`

  return (
    <figure className={cn("my-8", className)} {...props}>
      {!isError ? (
        <div className="relative rounded-lg overflow-hidden ">
          <Image
            src={imageUrl}
            alt={media.alternativeText || caption || ''}
            width={media.width}
            height={media.height}
            className="w-full h-auto"
            onError={() => setIsError(true)}
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-[#1E2C6B]">Image could not be loaded</p>
        </div>
      )}
      {caption && (
        <figcaption className="text-center mt-4 text-sm text-[#1E2C6B]">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export function RichText({ content, className, ...props }: RichTextProps) {
  if (!content) return null

  return (
    <div className={cn("prose max-w-none my-8 prose-headings:text-[#1E2C6B] prose-a:text-[#C4A484] prose-strong:text-[#1E2C6B]", className)} {...props}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

export function TwoColumnLayout({ leftColumn, rightColumn, className, ...props }: TwoColumnLayoutProps) {
  if (!leftColumn && !rightColumn) return null

  const renderColumn = (column: any) => {
    if (typeof column === 'string') {
      return <ReactMarkdown>{column}</ReactMarkdown>
    }
    return column.map((item: any, index: number) => {
      if (item.type === 'paragraph') {
        return <div key={index}>{renderRichText(item.children)}</div>
      }
      if (item.type === 'heading') {
        const HeadingTag = `h${item.level}` as keyof JSX.IntrinsicElements
        return <HeadingTag key={index}>{renderRichText(item.children)}</HeadingTag>
      }
      if (item.type === 'list') {
        return (
          <ul key={index} className={item.format === 'ordered' ? 'list-decimal' : 'list-disc'}>
            {item.children.map((listItem: any, listItemIndex: number) => (
              <li key={listItemIndex}>
                {renderRichText(listItem.children)}
              </li>
            ))}
          </ul>
        )
      }
      return null
    })
  }

  const renderRichText = (textItems: TextItem[]): React.ReactNode => {
    return textItems.map((item: TextItem, index: number) => {
      let content: React.ReactNode = item.text.trim()
      
      if (item.bold) content = <strong key={index}>{content}</strong>
      if (item.italic) content = <em key={index}>{content}</em>
      if (item.strikethrough) content = <s key={index}>{content}</s>
      if (item.underline) content = <span key={index} style={{ textDecoration: 'underline' }}>{content}</span>
      
      if (item.isList) {
        content = <span key={index}>• {content}</span>
      }
      
      return <span key={index}>{content}</span>
    })
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 my-8", className)} {...props}>
      <Card className="p-3 ">
        <div className="prose max-w-none prose-headings:text-[#1E2C6B]">
          {renderColumn(leftColumn)}
        </div>
      </Card>
      <Card className="p-3 ">
        <div className="prose max-w-none prose-headings:text-[#1E2C6B]">
          {renderColumn(rightColumn)}
        </div>
      </Card>
    </div>
  )
}

export function Slider({ files, className, ...props }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!files?.length) return null

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length)
  }

  return (
    <div className={cn("relative my-8", className)} {...props}>
      <div className="overflow-hidden rounded-lg shadow-lg">
        <div className="relative aspect-video">
          {files.map((file, index) => {
            const imageUrl = file.url.startsWith('http') 
              ? file.url 
              : `${API_URL}/${file.url}`

            return (
              <div
                key={`${file.id}-${index}`}
                className={cn(
                  "absolute w-full h-full transition-opacity duration-500",
                  index === currentIndex ? "opacity-100" : "opacity-0"
                )}
              >
                <Image
                  src={imageUrl}
                  alt={file.alternativeText || ''}
                  fill
                  className="object-cover"
                />
              </div>
            )
          })}
        </div>
      </div>
      {files.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="rounded-full border-[#1E2C6B] text-[#1E2C6B] hover:bg-[#1E2C6B] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-full border-[#1E2C6B] text-[#1E2C6B] hover:bg-[#1E2C6B] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export function SEO({ metaTitle, metaDescription }: SEOProps) {
  if (!metaTitle && !metaDescription) return null
  
  return (
    <>
      {metaTitle && <title>{metaTitle}</title>}
      {metaDescription && <meta name="description" content={metaDescription} />}
    </>
  )
}

export function TwoColumnFormLayout({ leftColumn, rightColumn, className, ...props }: TwoColumnFormLayoutProps) {
  const renderColumn = (column: any) => {
    if (typeof column === 'string') {
      return <ReactMarkdown>{column}</ReactMarkdown>
    }
    return column.map((item: any, index: number) => {
      if (item.type === 'paragraph') {
        return <div key={index}>{renderRichText(item.children)}</div>
      }
      if (item.type === 'heading') {
        const HeadingTag = `h${item.level}` as keyof JSX.IntrinsicElements
        return <HeadingTag key={index}>{renderRichText(item.children)}</HeadingTag>
      }
      if (item.type === 'list') {
        return (
          <ul key={index} className={item.format === 'ordered' ? 'list-decimal' : 'list-disc'}>
            {item.children.map((listItem: any, listItemIndex: number) => (
              <li key={listItemIndex}>
                {renderRichText(listItem.children)}
              </li>
            ))}
          </ul>
        )
      }
      return null
    })
  }

  const renderRichText = (textItems: TextItem[]): React.ReactNode => {
    return textItems.map((item: TextItem, index: number) => {
      let content: React.ReactNode = item.text.trim()

      if (item.bold) content = <strong key={index}>{content}</strong>
      if (item.italic) content = <em key={index}>{content}</em>
      if (item.strikethrough) content = <s key={index}>{content}</s>
      if (item.underline) content = <span key={index} style={{ textDecoration: 'underline' }}>{content}</span>

      if (item.isList) {
        content = <span key={index}>• {content}</span>
      }

      return <span key={index}>{content}</span>
    })
  }

  const renderRightColumn = () => {
    if (!rightColumn) {
      return null
    }

    if (typeof rightColumn === 'object' && 'title' in rightColumn) {
      return <InsuranceQuoteForm title={rightColumn.title} />
    }

    return rightColumn
  }

  return (
    <div className={cn("my-4", className)} {...props}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-3 border-none shadow-none">
          <div className="prose max-w-none prose-headings:text-[#1E2C6B]">
            {renderColumn(leftColumn)}
          </div>
        </Card>
        <Card className="p-3 border-none shadow-none">
          <div className="prose max-w-none prose-headings:text-[#1E2C6B]">
            {renderRightColumn()}
          </div>
        </Card>
      </div>
    </div>
  )
}