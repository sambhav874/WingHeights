import ReactMarkdown from 'react-markdown'

interface RichTextProps {
  body: string
}

export function RichText({ body }: RichTextProps) {
  return (
    <div className="my-8 prose max-w-none">
      <ReactMarkdown>{body}</ReactMarkdown>
    </div>
  )
}