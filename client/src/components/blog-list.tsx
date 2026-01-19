import { Link } from "wouter";
import { BlogPost } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="space-y-12">
      <div className="flex items-baseline justify-between border-b border-border pb-4 mb-8">
        <h2 className="font-serif text-3xl md:text-4xl">Journal</h2>
        <Link 
          href="/journal"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          View all <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid gap-12">
        {posts.map((post, i) => (
          <div
            key={post.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Link 
              href={`/journal/${post.id}`}
              className="group block grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12 items-start" 
              data-testid={`blog-card-${post.id}`}
            >
              <div className="space-y-2 md:text-right">
                <p className="text-sm font-medium text-muted-foreground font-mono">{post.date}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/70">{post.category}</p>
              </div>
              
              <div className="space-y-3 group-hover:-translate-y-1 transition-transform duration-300">
                <h3 className="font-serif text-2xl md:text-3xl group-hover:underline decoration-1 underline-offset-4">
                  {post.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-2xl">
                  {post.excerpt}
                </p>
                <span className="text-xs font-medium uppercase tracking-widest text-primary pt-2 block opacity-0 group-hover:opacity-100 transition-opacity">
                  Read Article
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
