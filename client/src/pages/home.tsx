import Layout from "@/components/layout";
import Hero from "@/components/hero";
import PortfolioGrid from "@/components/portfolio-grid";
import BlogList from "@/components/blog-list";
import { getPosts, getPortfolioItems } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { AuthorPost, AuthorPortfolio } from "@shared/schema";

function formatPostForDisplay(post: AuthorPost) {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || "",
    date: post.publishedAt 
      ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    category: post.category || "Uncategorized",
    readTime: `${post.readTimeMinutes || 1} min read`,
    image: post.featuredImageUrl || "",
    content: post.content,
  };
}

function formatPortfolioForDisplay(item: AuthorPortfolio) {
  return {
    id: item.id,
    title: item.title,
    category: item.category || "Project",
    year: item.year || new Date().getFullYear().toString(),
    image: item.imageUrl || "",
  };
}

export default function Home() {
  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts(true)
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => getPortfolioItems(true)
  });

  return (
    <Layout>
      <Hero />
      <PortfolioGrid items={portfolio.map(formatPortfolioForDisplay)} />
      <BlogList posts={posts.map(formatPostForDisplay)} />
    </Layout>
  );
}
