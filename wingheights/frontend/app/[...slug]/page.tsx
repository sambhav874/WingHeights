import { notFound } from 'next/navigation'
import { getPageData, getNavigation } from '@/lib/api'
import { DynamicPage } from '@/components/DynamicPage'

export default async function SlugPage({ params }: { params: { slug: string[] } }) {
  // Join the slug array with forward slashes to create the full path
  const fullPath = params.slug.join('/')
  
  // Try different path combinations to find the correct content
  const pathsToTry = [
    fullPath, // Try the full path first
    params.slug[params.slug.length - 1], // Try just the last segment
    params.slug.slice(-2).join('/') // Try the last two segments
  ]

  let pageData = null
  
  // Try each path combination until we find content
  for (const path of pathsToTry) {
    pageData = await getPageData(path)
    if (pageData) break
  }

  // If no content is found for any path combination, show 404
  if (!pageData) {
    console.log(`No content found for paths: ${pathsToTry.join(', ')}`)
    notFound()
  }

  return <DynamicPage pageData={pageData} />
}

// Generate dynamic segments
export async function generateStaticParams() {
  const navigation = await getNavigation()
  const paths: { slug: string[] }[] = []

  function addPaths(items: any[], parentPath: string[] = []) {
    items?.forEach(item => {
      const currentPath = [...parentPath, item.path]
      paths.push({ slug: currentPath })

      // Add paths for sub-items
      if (item.items?.length > 0) {
        addPaths(item.items, currentPath)
      }
    })
  }

  if (navigation) {
    addPaths(navigation)
  }

  return paths
}