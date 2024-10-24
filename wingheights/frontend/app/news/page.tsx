'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Article {
  source: {
    id: string | null
    name: string
  }
  author: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  content: string
}

interface NewsApiResponse {
  status: string
  totalResults: number
  articles: Article[]
}

export default function NewsApiFetcher() {
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&from=2024-09-10&sortBy=publishedAt&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`)
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      const data: NewsApiResponse = await response.json()
      setArticles(data.articles)
    } catch (err) {
      setError('Error fetching news. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fetch news</h1>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Enter your interest"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mr-2"
        />
        <Button onClick={fetchNews} disabled={loading || !query}>
          {loading ? 'Fetching...' : 'Fetch News'}
        </Button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">
                By {article.author} | {new Date(article.publishedAt).toLocaleString()}
              </p>
              <p className="mb-2">{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Read more
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}