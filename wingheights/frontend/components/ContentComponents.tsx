'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Link, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import { InsuranceQuoteForm } from './InsuranceQuoteForm'

import { useEffect } from 'react'

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



interface CardSectionProps {
  title: string
  description: string
  cards: Array<{
    id: string
    title: string
    content: string
    image: {
      url: string
      alternativeText?: string
      width: number
      height: number
    }
    link?: string
  }>
}

interface CardItemProps {
  title: string
  content: string | any[]
  image?: {
    url: string
    alternativeText?: string
  }
  link?: string
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

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])
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
    <div className={cn("relative py-16 px-8 bg-gradient-to-b from-background to-background/80 overflow-hidden", className)} {...props}>
      <div className="absolute inset-0 opacity-5" />
      <div className="absolute inset-0  mix-blend-soft-light opacity-50" />
      
      <div className={cn(
        "relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-1000",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}>
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/10 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <div className="prose max-w-none prose-headings:text-primary prose-p:text-muted-foreground prose-a:text-secondary hover:prose-a:text-secondary/80 prose-strong:text-primary/80">
            {renderColumn(leftColumn)}
          </div>
          <Sparkles className="absolute top-4 right-4 w-5 h-5 text-secondary animate-pulse opacity-70" />
        </Card>
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/10 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <div className="prose max-w-none prose-headings:text-primary prose-p:text-muted-foreground prose-a:text-secondary hover:prose-a:text-secondary/80 prose-strong:text-primary/80">
            {renderColumn(rightColumn)}
          </div>
          <Sparkles className="absolute top-4 right-4 w-5 h-5 text-secondary animate-pulse opacity-70" />
        </Card>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
        
      </div>
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
              : `${API_URL}${file.url}`

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


function CardItem({ title, content, image, link }: CardItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || ''
  const imageUrl = image ? `${baseUrl}${image.url}` : '/placeholder.svg'

  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return <ReactMarkdown>{content}</ReactMarkdown>
    }
    if (Array.isArray(content)) {
      return content.map((item: any, index: number) => {
        if (item.type === 'paragraph') {
          return (
            <p key={index} className="mb-4 leading-relaxed tracking-wide animate-fadeIn">
              {item.children.map((child: any) => child.text).join('')}
            </p>
          )
        }
        if (item.type === 'heading') {
          const HeadingTag = `h${item.level}` as keyof JSX.IntrinsicElements
          return (
            <div key={index} className="animate-slideInLeft">
              <HeadingTag className="font-bold mb-4 text-primary relative inline-block group">
                {item.children.map((child: any) => child.text).join('')}
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
              </HeadingTag>
            </div>
          )
        }
        if (item.type === 'list') {
          return (
            <ul
              key={index}
              className={`${
                item.format === 'ordered' ? 'list-decimal' : 'list-disc'
              } pl-6 mb-4 space-y-3 marker:text-primary animate-slideInRight`}
            >
              {item.children.map((listItem: any, listItemIndex: number) => (
                <li key={listItemIndex} className="text-muted-foreground leading-relaxed">
                  {listItem.children.map((child: any) => child.text).join('')}
                </li>
              ))}
            </ul>
          )
        }
        return null
      })
    }
    return null
  }

  return (
    <Card
      className="group relative flex flex-col h-full bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {image && (
        <div className="relative h-72 overflow-hidden">
          <Image
            src={imageUrl}
            alt={image.alternativeText || 'Card image'}
            layout="fill"
            objectFit="cover"
            className="transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-90' : 'opacity-70'
            }`}
          />
          <div
            className={`absolute top-4 right-4 transition-all duration-300 ${
              isHovered ? 'opacity-100 rotate-12' : 'opacity-0 rotate-0'
            }`}
          >
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
        </div>
      )}

      <CardHeader className={`px-8 pt-8 pb-4 backdrop-blur-xl bg-opacity-10 ${image ? 'mt-[-3rem] relative z-10' : ''}`}>
        {title && (
          <CardTitle className="text-3xl font-serif italic leading-tight text-card-foreground   text-[#1E2C6B]">
            <span className="inline-block animate-slideInLeft">{title}</span>
            <span
              className={`block h-0.5 bg-primary mt-2 transition-all duration-300 ${
                isHovered ? 'w-24' : 'w-12'
              }`}
            />
          </CardTitle>
        )}
      </CardHeader>

      <CardContent className="flex-grow px-4 sm:px-6 md:px-8 py-2 sm:py-4">
        {content && (
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-primary prose-headings:font-serif prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:tracking-wide prose-a:text-primary prose-a:no-underline prose-a:border-b prose-a:border-primary hover:prose-a:text-primary/80 animate-fadeIn overflow-auto">
            {renderContent(content)}
          </div>
        )}
      </CardContent>

      {link && (
        <CardFooter className="p-8 mt-auto">
          <Button
            asChild
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 group"
            size="lg"
          >
            <a href={link} className="flex items-center justify-center gap-3 py-3 rounded-xl relative overflow-hidden">
              <span className="relative z-10">Explore More</span>
              <span
                className={`transition-all duration-300 ${
                  isHovered ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
                }`}
              >
                <ExternalLink className="h-4 w-4" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export function CardSection({ title, description, cards }: CardSectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return <ReactMarkdown>{content}</ReactMarkdown>
    }
    if (Array.isArray(content)) {
      return content.map((item: any, index: number) => {
        if (item.type === 'paragraph') {
          return (
            <p key={index} className="mb-4 leading-relaxed tracking-wide text-muted-foreground animate-fadeIn">
              {item.children.map((child: any) => child.text).join('')}
            </p>
          )
        }
        if (item.type === 'heading') {
          const HeadingTag = `h${item.level}` as keyof JSX.IntrinsicElements
          return (
            <div key={index} className="animate-slideInLeft">
              <HeadingTag className="font-serif italic font-bold mb-6 text-primary">
                {item.children.map((child: any) => child.text).join('')}
              </HeadingTag>
            </div>
          )
        }
        if (item.type === 'list') {
          return (
            <ul
              key={index}
              className={`${
                item.format === 'ordered' ? 'list-decimal' : 'list-disc'
              } pl-6 mb-4 space-y-3 animate-slideInRight`}
            >
              {item.children.map((listItem: any, listItemIndex: number) => (
                <li key={listItemIndex} className="text-muted-foreground leading-relaxed">
                  {listItem.children.map((child: any) => child.text).join('')}
                </li>
              ))}
            </ul>
          )
        }
        return null
      })
    }
    return null
  }

  return (
    <section className="relative py-32 px-4 lg:px-10 bg-gradient-to-b from-background via-background/95 to-background/80 overflow-hidden">
      <div className="absolute inset-0  opacity-5" />
      <div className="absolute inset-0  mix-blend-soft-light opacity-50" />
      
      <div
        className={`relative z-10 max-w-7xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {(title || description) && (
          <div className="text-center mb-20">
            {title && (
              <h2 className="relative inline-block group animate-fadeIn">
                <span className="text-3xl md:text-6xl font-serif italic text-primary mb-6 block">
                  {title}
                </span>
                <span className="absolute -bottom-2 left-1/2 w-1/2 h-0.5 bg-secondary transform -translate-x-1/2 transition-all duration-300 group-hover:w-full" />
                <span className="absolute -top-8 -right-8 animate-pulse opacity-70">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </span>
              </h2>
            )}
            {description && (
              <div className="mt-12 max-w-3xl mx-auto bg-card/5 backdrop-blur-md p-10 rounded-2xl border border-border shadow-2xl animate-fadeIn">
                <div className="prose prose-lg max-w-none prose-p:leading-relaxed prose-p:tracking-wide prose-headings:font-serif prose-headings:italic">
                  {renderContent(description)}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {cards.map((card, index) => (
            <div key={index} className={`animate-fadeIn animation-delay-${index * 100}`}>
              <CardItem
                title={card.title}
                content={card.content}
                image={card.image}
                link={card.link}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        
      </div>
    </section>
  )
}

export default CardSection