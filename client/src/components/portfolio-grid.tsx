import { PortfolioItem } from "@/lib/data";

export default function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  return (
    <div className="mb-32">
       <div className="flex items-baseline justify-between border-b border-border pb-4 mb-12">
        <h2 className="font-serif text-3xl md:text-4xl">Selected Work</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="group cursor-pointer animate-in fade-in zoom-in-95 duration-500"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted mb-4">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 grayscale group-hover:grayscale-0"
              />
            </div>
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium text-lg">{item.title}</h3>
              <span className="text-sm text-muted-foreground font-mono">{item.year}</span>
            </div>
            <p className="text-sm text-muted-foreground">{item.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
