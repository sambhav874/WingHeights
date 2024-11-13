export interface NavigationItem {
    id: number
    title: string
    path: string
    items?: NavigationItem[]
    type: string
    parent?: {
      id: number
    }
    related?: {
      data: {
        slug: string
      }
    }
  }
  
  export interface PageData {
    id: number
    title: string
    
    content2: ContentItem[]
    
    
  }
  
  export interface ContentItem {
    __component: string
    id: number
    [key: string]: any
  }
  
  export interface QuoteComponent {
    text: string
    author?: string
  }
  
  export interface MediaComponent {
    media: {
      
        
          url: string
          alternativeText: string
          width: number
          height: number
        
      
    }
    caption?: string
  }
  
  export interface RichTextComponent {
    content: string
  }
  
  export interface TwoColumnLayoutComponent {
    leftColumn: string
    rightColumn: string
  }
  
  export interface SliderComponent {
    files: {
      
        id: number
        
          url: string
          alternativeText: string
          width: number
          height: number
        
      
    }
  }
  
  export interface SEOComponent {
    metaTitle: string
    metaDescription: string
  }