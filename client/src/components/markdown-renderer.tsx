import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const customSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "video", "source", "iframe"],
  attributes: {
    ...defaultSchema.attributes,
    video: ["src", "controls", "autoplay", "loop", "muted", "poster", "width", "height", "className"],
    source: ["src", "type"],
    iframe: ["src", "width", "height", "frameborder", "allowfullscreen", "allow"],
    img: [...(defaultSchema.attributes?.img || []), "alt", "src", "title", "width", "height", "loading"],
  },
};

const components: Components = {
  img: ({ node, ...props }) => (
    <img
      {...props}
      loading="lazy"
      className="max-w-full h-auto rounded-lg my-4"
    />
  ),
  video: ({ node, ...props }) => (
    <video
      {...props}
      controls
      className="max-w-full h-auto rounded-lg my-4"
    />
  ),
  a: ({ node, ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    />
  ),
  h1: ({ node, ...props }) => (
    <h1 {...props} className="font-serif text-3xl font-bold mt-8 mb-4" />
  ),
  h2: ({ node, ...props }) => (
    <h2 {...props} className="font-serif text-2xl font-bold mt-6 mb-3" />
  ),
  h3: ({ node, ...props }) => (
    <h3 {...props} className="font-serif text-xl font-semibold mt-5 mb-2" />
  ),
  h4: ({ node, ...props }) => (
    <h4 {...props} className="font-serif text-lg font-semibold mt-4 mb-2" />
  ),
  p: ({ node, ...props }) => (
    <p {...props} className="my-4 leading-relaxed" />
  ),
  ul: ({ node, ...props }) => (
    <ul {...props} className="my-4 ml-6 list-disc space-y-2" />
  ),
  ol: ({ node, ...props }) => (
    <ol {...props} className="my-4 ml-6 list-decimal space-y-2" />
  ),
  li: ({ node, ...props }) => (
    <li {...props} className="leading-relaxed" />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      {...props}
      className="border-l-4 border-muted-foreground/30 pl-4 my-4 italic text-muted-foreground"
    />
  ),
  code: ({ node, className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          {...props}
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {children}
        </code>
      );
    }
    return (
      <code
        {...props}
        className={`block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono my-4 ${className || ""}`}
      >
        {children}
      </code>
    );
  },
  pre: ({ node, ...props }) => (
    <pre {...props} className="bg-muted rounded-lg overflow-x-auto my-4" />
  ),
  hr: ({ node, ...props }) => (
    <hr {...props} className="my-8 border-border" />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table {...props} className="min-w-full border-collapse border border-border" />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th {...props} className="border border-border px-4 py-2 bg-muted font-semibold text-left" />
  ),
  td: ({ node, ...props }) => (
    <td {...props} className="border border-border px-4 py-2" />
  ),
};

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function HtmlRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
