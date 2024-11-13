import Head from 'next/head'

interface SEOProps {
  metaTitle: string
  metaDescription: string
}

export function SEO({ metaTitle, metaDescription }: SEOProps) {
  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
    </Head>
  )
}