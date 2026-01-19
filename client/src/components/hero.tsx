export default function Hero() {
  return (
    <section className="mb-24 md:mb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <span className="block text-sm font-medium tracking-widest text-muted-foreground mb-6 uppercase">
        Insights & Creative Work
      </span>
      <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight max-w-4xl text-balance mb-8">
        Where ideas meet <span className="italic text-muted-foreground">expression</span>.
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
        A curated space for sharing thoughts on design, technology, law, and the creative process. 
        Explore articles, case studies, and portfolio pieces.
      </p>
    </section>
  );
}
