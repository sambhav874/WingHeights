interface QuoteProps {
    title: string
    body: string
  }
  
  export function Quote({ title, body }: QuoteProps) {
    return (
      <blockquote className="my-8 p-6 bg-gray-100 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-700 italic">{body}</p>
      </blockquote>
    )
  }