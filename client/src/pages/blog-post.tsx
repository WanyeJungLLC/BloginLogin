import Layout from "@/components/layout";
import { useRoute } from "wouter";
import { getPost } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import NotFound from "@/pages/not-found";
import MarkdownRenderer from "@/components/markdown-renderer";

export default function BlogPost() {
  const [match, params] = useRoute("/journal/:id");
  
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', params?.id],
    queryFn: () => params?.id ? getPost(params.id) : undefined,
    enabled: !!params?.id
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-20 text-center">Loading...</div>
      </Layout>
    );
  }

  if (!match || !post) {
    return <NotFound />;
  }

  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Layout>
      <article className="max-w-3xl mx-auto pt-12 md:pt-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link 
          href="/journal"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>

        <header className="mb-12">
          <div className="flex gap-4 text-sm text-muted-foreground font-mono mb-6">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{post.readTimeMinutes || 1} min read</span>
            <span>•</span>
            <span>{post.category || "Uncategorized"}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-8">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.featuredImageUrl && (
          <div className="aspect-video w-full overflow-hidden mb-12 bg-muted">
            <img 
              src={post.featuredImageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <MarkdownRenderer content={post.content} className="font-serif" />
      </article>
    </Layout>
  );
}
