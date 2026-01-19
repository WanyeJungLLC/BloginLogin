import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Settings, Home, BookOpen } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/80 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex-shrink-0 min-w-0">
            <Link 
              href="/"
              className="font-serif text-base sm:text-xl font-medium tracking-tight hover:opacity-70 transition-opacity" 
              data-testid="link-home"
            >
              BloginLogin
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "outline"} 
                size="sm" 
                className="h-7 sm:h-8 px-2 sm:px-3"
                data-testid="link-home-btn"
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline ml-2 text-xs sm:text-sm">Home</span>
              </Button>
            </Link>
            <Link href="/journal">
              <Button 
                variant={location === "/journal" || location.startsWith("/journal/") ? "default" : "outline"} 
                size="sm" 
                className="h-7 sm:h-8 px-2 sm:px-3"
                data-testid="link-journal"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline ml-2 text-xs sm:text-sm">Journal</span>
              </Button>
            </Link>

            {loading ? (
              <span className="text-sm text-muted-foreground px-2">...</span>
            ) : user ? (
              <>
                <Link href="/admin">
                  <Button 
                    variant={location.startsWith("/admin") ? "default" : "outline"} 
                    size="sm" 
                    className="h-7 sm:h-8 px-2 sm:px-3"
                    data-testid="link-admin"
                  >
                    <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline ml-2 text-xs sm:text-sm">Admin</span>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="h-7 sm:h-8 px-2 sm:px-3"
                  data-testid="button-signout"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline ml-2 text-xs sm:text-sm">Sign Out</span>
                </Button>
              </>
            ) : (
              <Link href="/admin/login">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 sm:h-8 px-2 sm:px-3"
                  data-testid="link-signin"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline ml-2 text-xs sm:text-sm">Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto min-h-[calc(100vh-100px)]">
        {children}
      </main>

      <footer className="px-4 sm:px-6 py-12 border-t border-border mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-6xl mx-auto">
          <div>
            <p className="font-serif text-lg mb-1">BloginLogin</p>
            <p className="text-sm text-muted-foreground">Insights, articles, and creative work.</p>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} BloginLogin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
