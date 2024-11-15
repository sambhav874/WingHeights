
interface TextItem {
    text: string
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    isList?: boolean
  }


export const displayRichText = (textItems: TextItem[]): React.ReactNode => {
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
  