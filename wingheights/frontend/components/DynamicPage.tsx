import { HeadBanner, Quote, Media, RichText, TwoColumnLayout, Slider, SEO, TwoColumnFormLayout, CardSection, CardItem } from '@/components/ContentComponents'
import { InsuranceQuoteForm } from '@/components/InsuranceQuoteForm'
import { ContentItem, PageData } from '@/types'

interface DynamicPageProps {
  pageData: PageData
}

export function DynamicPage({ pageData }: DynamicPageProps) {
  const renderContent = (item: ContentItem) => {
    switch (item.__component) {
      case 'shared.quote':
        return <Quote text={item.text} author={item.author} key={item.id} />
      case 'shared.media':
        return <Media 
          media={{
            url: item.media.url,
            alternativeText: item.media.alternativeText,
            width: item.media.width,
            height: item.media.height
          }} 
          caption={item.caption}
          key={item.id} 
        />
      case 'shared.rich-text':
        return <RichText content={item.content} key={item.id} />
      case 'shared.two-column-layout':
        return <TwoColumnLayout leftColumn={item.leftColumn} rightColumn={item.rightColumn} key={item.id} />
      case 'page-components.slider':
        return <Slider files={item.files} key={item.id} />
      case 'seo.seo':
        return <SEO metaTitle={item.metaTitle} metaDescription={item.metaDescription} key={item.id} />
      case 'forms.insurance-quote-form':
        return <InsuranceQuoteForm title={item.title} key={item.id} />
      case 'forms.two-column-form-layout':
        return <TwoColumnFormLayout 
          leftColumn={item.leftColumn} 
          rightColumn={
            item.rightColumn && 'title' in item.rightColumn 
              ? <InsuranceQuoteForm title={item.rightColumn.title} />
              : item.rightColumn
          } 
          key={item.id} 
        />
        case 'page-components.card-section':
            return <CardSection title={item.title} description={item.description} cards={item.cards} key={item.id} />
          
      default:
        return null
    }
  }

  const content2 = pageData.content2 || []
  const headBanner = content2.find(item => item.__component === 'page-components.head-banner')
  const seoComponent = content2.find(item => item.__component === 'seo.seo')

  return (
    <>
      {seoComponent && (
        <SEO 
          metaTitle={seoComponent.metaTitle} 
          metaDescription={seoComponent.metaDescription} 
          key={seoComponent.id} 
        />
      )}
      {headBanner && (
        <HeadBanner 
          title={headBanner.title} 
          smallDescription={headBanner.smallDescription} 
          key={headBanner.id} 
        />
      )}
      <div className="container mx-auto px-4 py-8">
        {content2.map(item => {
          if (item.__component !== 'seo.seo' && item.__component !== 'page-components.head-banner') {
            return <div key={item.id}>{renderContent(item)}</div>
          }
          
          return null
        })}
      </div>
    </>
  )
}

export default DynamicPage