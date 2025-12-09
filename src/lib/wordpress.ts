import { GraphQLClient } from 'graphql-request';

const WP_GraphQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://demo.wpengine.com/graphql';
const WP_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL || 'https://demo.wpengine.com/wp-json';

// ============================================
// Types
// ============================================

export interface SEOMeta {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
}

export interface SchemaConfig {
  type: 'Article' | 'BlogPosting' | 'NewsArticle' | 'Organization' |
  'SoftwareApplication' | 'WebPage' | 'FAQPage' | 'HowTo' | 'Product' | 'LocalBusiness';
}

export interface TranslationKey {
  tag: string;
  content: string;
}

export interface TranslationKeys {
  [key: string]: TranslationKey;
}

export interface ManagedContent {
  id: number;
  slug: string;
  type: string;
  locale: string;
  title: string;
  description: string;
  content: string;
  featuredImage?: string;
  seo: SEOMeta;
  schema: SchemaConfig;
  translationKeys?: { [locale: string]: TranslationKeys };
  availableLocales: string[];
  modified: string;
}

export interface SitemapItem {
  slug: string;
  modified: string;
  locales?: string[];
}

export const wpClient = new GraphQLClient(WP_GraphQL_URL);

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content?: string;
  author: {
    node: {
      name: string;
    };
  };
  featuredImage?: {
    node: {
      sourceUrl: string;
    }
  }
}

export const getPosts = async (locale: string = 'en'): Promise<Post[]> => {
  const query = `
    query GetPosts {
      posts(first: 20) {
        nodes {
          slug
          title
          excerpt
          date
          author {
            node {
              name
            }
          }
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  `;

  try {
    const data: any = await wpClient.request(query);
    return data.posts.nodes;
  } catch (error) {
    console.error("Failed to fetch posts from WordPress, returning mocks.", error);
    return [
      {
        slug: 'hello-world',
        title: 'Hello World (Mock)',
        excerpt: '<p>This is a mock post because the WordPress endpoint is not reachable.</p>',
        date: new Date().toISOString(),
        author: { node: { name: 'Admin' } }
      },
      {
        slug: 'nextjs-wordpress',
        title: 'Next.js + WordPress (Mock)',
        excerpt: '<p>Building a headless CMS site is fun.</p>',
        date: new Date().toISOString(),
        author: { node: { name: 'Dev' } }
      }
    ];
  }
};

export const getPost = async (slug: string): Promise<Post | null> => {
  const query = `
      query GetPost($slug: ID!) {
        post(id: $slug, idType: SLUG) {
          title
          content
          date
          author {
            node {
              name
            }
          }
           featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    `;
  try {
    const data: any = await wpClient.request(query, { slug });
    return data.post;
  } catch (error) {
    console.error("Failed to fetch post, returning mock.", error);
    return {
      slug,
      title: `Mock Post: ${slug}`,
      excerpt: `<p>Excerpt for mock post ${slug}</p>`,
      content: `<p>This is the full content of the mock post for slug <strong>${slug}</strong>.</p><p>Lorem ipsum dolor sit amet...</p>`,
      date: new Date().toISOString(),
      author: { node: { name: 'Admin' } }
    };
  }
};

export const getPostsByCategory = async (categorySlug: string): Promise<Post[]> => {
  console.log(`Fetching posts for category: ${categorySlug}`);
  return [
    {
      slug: 'category-post-1',
      title: `Post in ${categorySlug}`,
      excerpt: `<p>This is a post in the category <strong>${categorySlug}</strong>.</p>`,
      date: new Date().toISOString(),
      author: { node: { name: 'Admin' } }
    }
  ];
};

export const getPostsByAuthor = async (authorSlug: string): Promise<Post[]> => {
  console.log(`Fetching posts for author: ${authorSlug}`);
  return [
    {
      slug: 'author-post-1',
      title: `Post by ${authorSlug}`,
      excerpt: `<p>This is a post written by <strong>${authorSlug}</strong>.</p>`,
      date: new Date().toISOString(),
      author: { node: { name: authorSlug } }
    }
  ];
};

// ============================================
// Managed Content Functions (Pages & Tools)
// ============================================

/**
 * Fetch a managed page by slug and locale
 */
export const getPage = async (slug: string, locale: string = 'en'): Promise<ManagedContent | null> => {
  try {
    const response = await fetch(
      `${WP_REST_URL}/antigravity/v1/content/page/${slug}?locale=${locale}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch page ${slug}:`, error);

    // Return mock data for development
    return {
      id: 0,
      slug,
      type: 'ag_page',
      locale,
      title: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')} (Mock)`,
      description: `This is a mock description for the ${slug} page.`,
      content: `<h1>${slug.replace(/-/g, ' ')}</h1><p>This is mock content. Configure your WordPress to see real content.</p>`,
      seo: {
        title: `${slug} | AntiGravity`,
        description: `Mock description for ${slug}`,
      },
      schema: { type: 'WebPage' },
      availableLocales: ['en', 'es', 'fr', 'de'],
      modified: new Date().toISOString(),
    };
  }
};

/**
 * Fetch a tool page by slug and locale
 */
export const getToolContent = async (slug: string, locale: string = 'en'): Promise<ManagedContent | null> => {
  try {
    const response = await fetch(
      `${WP_REST_URL}/antigravity/v1/content/tool/${slug}?locale=${locale}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch tool ${slug}:`, error);

    // Return mock data for development
    return {
      id: 0,
      slug,
      type: 'ag_tool',
      locale,
      title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} (Mock)`,
      description: `This is a mock description for the ${slug} tool.`,
      content: `<p>Configure WordPress to see real content for this tool.</p>`,
      seo: {
        title: `${slug.replace(/-/g, ' ')} | Free Online Tool`,
        description: `Use our free ${slug.replace(/-/g, ' ')} tool online.`,
      },
      schema: { type: 'SoftwareApplication' },
      availableLocales: ['en', 'es', 'fr', 'de'],
      modified: new Date().toISOString(),
    };
  }
};

/**
 * Fetch all content for sitemap generation
 */
export const getSitemapData = async (): Promise<{
  tools: SitemapItem[];
  pages: SitemapItem[];
  posts: SitemapItem[];
}> => {
  try {
    const response = await fetch(
      `${WP_REST_URL}/antigravity/v1/sitemap`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch sitemap data:', error);

    // Return mock data
    return {
      tools: [
        { slug: 'fancy-text-generator', modified: new Date().toISOString(), locales: ['en', 'es', 'fr', 'de'] },
        { slug: 'ai-content-helper', modified: new Date().toISOString(), locales: ['en', 'es', 'fr', 'de'] },
      ],
      pages: [
        { slug: 'about', modified: new Date().toISOString(), locales: ['en', 'es', 'fr', 'de'] },
        { slug: 'contact', modified: new Date().toISOString(), locales: ['en', 'es', 'fr', 'de'] },
        { slug: 'privacy-policy', modified: new Date().toISOString(), locales: ['en', 'es', 'fr', 'de'] },
      ],
      posts: [
        { slug: 'hello-world', modified: new Date().toISOString() },
      ],
    };
  }
};

/**
 * Fetch translation keys for a content item
 */
export const getTranslationKeys = async (slug: string): Promise<{ [locale: string]: TranslationKeys } | null> => {
  try {
    const response = await fetch(
      `${WP_REST_URL}/antigravity/v1/translations/${slug}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch translation keys for ${slug}:`, error);
    return null;
  }
};

/**
 * Get all managed pages for static generation
 */
export const getAllPages = async (): Promise<SitemapItem[]> => {
  const data = await getSitemapData();
  return data.pages;
};

/**
 * Get all tools for static generation
 */
export const getAllTools = async (): Promise<SitemapItem[]> => {
  const data = await getSitemapData();
  return data.tools;
};
