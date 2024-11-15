import { NavigationItem, PageData } from "@/types";
import axios from "axios";
import qs from "qs";

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

// Fetch navigation data
export async function getNavigation(): Promise<NavigationItem[] | null> {
  try {
    const res = await fetch(`${API_URL}/api/navigation/render/navigation`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch navigation");
    }

    const data = await res.json();
    return processNavigationData(data);
  } catch (error) {
    console.error("Error fetching navigation:", error);
    return null;
  }
}

// Process navigation data recursively
function processNavigationData(items: NavigationItem[]): NavigationItem[] {
  return items.map((item) => {
    let processedItem = { ...item };

    if (item.parent) {
      const parentPath = item.path.split("/").slice(0, -1).join("/");
      processedItem.path = `${parentPath}/${item.path}`;
    }

    if (item.items && item.items.length > 0) {
      processedItem.items = processNavigationData(item.items);
    }

    return processedItem;
  });
}

// Fetch page data with `qs` query
export async function getPageData(slug: string): Promise<PageData | null> {
  try {
    // Clean the slug by removing leading/trailing slashes and handling empty strings
    const cleanSlug = slug.replace(/^\/+|\/+$/g, "") || "home";

    // Query string for exact match with the provided `qs` structure
    const query = qs.stringify(
      {
        filters: {
          slug: {
            $eq: cleanSlug,
          },
        },
        populate: {
          content2: {
            populate: "*",
            on: {
              "page-components.card-section": {
                populate: {
                  cards: {
                    populate: ["image"],
                  },
                },
              },
              "page-components.card": {
                populate: "*",
              },
              "seo.seo": {
                populate: "*",
              },
              "page-components.head-banner": {
                populate: "*",
              },
              "page-components.slider": {
                populate: "*",
              },
              "shared.rich-text": {
                populate: "*",
              },
              "shared.two-column-layout": {
                populate: "*",
              },
              "shared.quote": {
                populate: "*",
              },
              "shared.media": {
                populate: "*",
              },
              "forms.two-column-form-layout": {
                populate: "*",
              },
              "forms.insurance-quote-form": {
                populate: "*",
              },
            },
          },
        },
      },
      { encodeValuesOnly: true }
    );

    const res = await axios.get(`${API_URL}/api/pages?${query}`);

    if (res.data.data && res.data.data.length > 0) {
      const pageData = res.data.data[0];
      return {
        id: pageData.id,
        title: pageData.title,
        content2: pageData.content2 || [],
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching page data:", error);
    return null;
  }
}