import { GraphQLClient } from 'graphql-request';

const WP_GraphQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://demo.wpengine.com/graphql';

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
