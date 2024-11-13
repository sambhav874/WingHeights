'use client'

import ReactMarkdown from 'react-markdown'

interface TwoColumnLayoutProps {
  left: string
  right: string
}

export function TwoColumnLayout({ left, right }: TwoColumnLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 mb-8">
      <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
        <ReactMarkdown className="prose max-w-none">{left}</ReactMarkdown>
      </div>
      <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
        <ReactMarkdown className="prose max-w-none">{right}</ReactMarkdown>
      </div>
    </div>
  )
}