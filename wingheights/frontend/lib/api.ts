import { NavigationItem, PageData } from "@/types";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;



export async function getNavigation(): Promise<NavigationItem[] | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/navigation/render/navigation`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch navigation');
    }

    const data = await res.json();
    return processNavigationData(data);
  } catch (error) {
    console.error('Error fetching navigation:', error);
    return null;
  }
}

function processNavigationData(items: NavigationItem[]): NavigationItem[] {
  return items.map(item => {
    let processedItem = { ...item };
    
    if (item.parent) {
      const parentPath = item.path.split('/').slice(0, -1).join('/');
      processedItem.path = `${parentPath}/${item.path}`;
    }

    if (item.items && item.items.length > 0) {
      processedItem.items = processNavigationData(item.items);
    }

    return processedItem;
  });
}

export async function getPageData(slug: string): Promise<PageData | null> {
  try {
    // Clean the slug by removing leading/trailing slashes and handling empty strings
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '') || 'home'
    
    // First try exact match
    const exactMatchRes = await axios.get(
      `${API_URL}/api/pages?filters[slug][$eq]=${cleanSlug}&populate[content2][populate]=*`
    )

    if (exactMatchRes.data.data && exactMatchRes.data.data.length > 0) {
      const pageData = exactMatchRes.data.data[0]
      return {
        id: pageData.id,
        title: pageData.title,
        content2: pageData.content2 || [],
      }
    }

    // If no exact match, try matching the last segment of the path
    const lastSegment = cleanSlug.split('/').pop()
    const fallbackRes = await axios.get(
      `${API_URL}/api/pages?filters[slug][$eq]=${lastSegment}&populate[content2][populate]=*`
    )

    if (fallbackRes.data.data && fallbackRes.data.data.length > 0) {
      const pageData = fallbackRes.data.data[0]
      return {
        id: pageData.id,
        title: pageData.title,
        content2: pageData.content2 || [],
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching page data:', error)
    return null
  }
}
