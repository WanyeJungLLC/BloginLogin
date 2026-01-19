import abstractGeo from '@assets/generated_images/abstract_minimalist_architectural_geometry.png';
import workspace from '@assets/generated_images/minimalist_creative_workspace_desk.png';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  content: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  year: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Architecture of Digital Silence",
    excerpt: "Exploring why whitespace is the most critical component in modern interface design and how it shapes user cognition.",
    date: "Dec 12, 2024",
    category: "Design Theory",
    readTime: "5 min read",
    image: abstractGeo,
    content: `
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">In an era of relentless notification and constant visual noise, the most luxurious digital commodity is silence. Not the absence of sound, but the absence of clutter.</p>
      
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">Minimalism isn't just an aesthetic choice; it's a functional imperative. When we strip away the non-essential, we aren't just making things look 'clean'—we are reducing cognitive load. We are respecting the user's attention.</p>
      
      <h3 class="text-2xl font-serif mt-8 mb-4 text-foreground">The Negative Space</h3>
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">Negative space is active. It guides the eye, creates hierarchy, and gives content room to breathe. Without it, even the most profound content feels suffocating.</p>
    `
  },
  {
    id: "2",
    title: "Curating Your Digital Garden",
    excerpt: "Moving away from the stream and towards the garden. How to build a personal knowledge base that grows over time.",
    date: "Nov 28, 2024",
    category: "Philosophy",
    readTime: "4 min read",
    image: workspace,
    content: `
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">The stream is ephemeral. It flows past you, and once it's gone, it's gone. The garden is different. It requires tending, pruning, and patience.</p>
      
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">Building a digital portfolio shouldn't be about shouting into the void. It should be about planting seeds—ideas, sketches, prototypes—and letting them mature into something substantial.</p>
    `
  },
  {
    id: "3",
    title: "Typography as Interface",
    excerpt: "Why type is often the only UI you actually need. A case study in typographic hierarchy.",
    date: "Oct 15, 2024",
    category: "Typography",
    readTime: "6 min read",
    image: abstractGeo,
    content: `
      <p class="mb-6 text-lg leading-relaxed text-muted-foreground">If web design is 95% typography, why do we spend so much time on boxes and shadows? The web is text. Understanding how to treat that text is the fundamental skill of the web designer.</p>
    `
  }
];

export const portfolioItems: PortfolioItem[] = [
  {
    id: "1",
    title: "Mono/Type",
    category: "Brand Identity",
    year: "2024",
    image: abstractGeo
  },
  {
    id: "2",
    title: "Lumina Interface",
    category: "Product Design",
    year: "2023",
    image: workspace
  },
  {
    id: "3",
    title: "Architectural Digest",
    category: "Web Development",
    year: "2023",
    image: abstractGeo
  }
];
