import Layout from "@/components/layout";
import BlogList from "@/components/blog-list";
import { getPosts } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { AuthorPost } from "@shared/schema";

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

export default function Journal() {
  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts(true)
  });

  return (
    <Layout>
      <div className="pt-20">
        <h1 className="font-serif text-5xl mb-16">Journal</h1>
        <BlogList posts={posts.map(formatPostForDisplay)} />
      </div>
    </Layout>
  );
}
