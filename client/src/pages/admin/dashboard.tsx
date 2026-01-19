import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LogOut, FileText, Edit, Trash2, Home, Briefcase, Settings, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPosts, deletePost, getPortfolioItems, deletePortfolioItem } from "@/lib/api";
import type { AuthorPost, AuthorPortfolio } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { user, signOut, loading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => getPosts(false)
  });

  const { data: portfolioItems = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ['admin-portfolio'],
    queryFn: () => getPortfolioItems(false)
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post: " + error.message);
    }
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: deletePortfolioItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (error: Error) => {
      console.error("Failed to delete portfolio item:", error);
      alert("Failed to delete portfolio item: " + error.message);
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/admin/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    setLocation("/admin/login");
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(id);
    }
  };

  const handleDeletePortfolioItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      deletePortfolioMutation.mutate(id);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Draft";
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex-shrink-0 min-w-0">
            <h1 className="font-serif text-base sm:text-xl font-medium truncate">BloginLogin Admin</h1>
            <p className="text-xs text-muted-foreground">{user.username}</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Link href="/">
              <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3">
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline ml-2 text-xs sm:text-sm">View Site</span>
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3">
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline ml-2 text-xs sm:text-sm">Settings</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-2 sm:px-3" onClick={handleSignOut}>
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline ml-2 text-xs sm:text-sm">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Blog Posts
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">Blog Posts</h2>
              <Link href="/admin/posts/new">
                <Button data-testid="button-new-post">
                  <Plus className="w-4 h-4 mr-2" /> New Post
                </Button>
              </Link>
            </div>

            {postsLoading ? (
              <p className="text-muted-foreground">Loading posts...</p>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <CardTitle className="mb-2">No posts yet</CardTitle>
                  <CardDescription className="mb-4">Create your first blog post to get started</CardDescription>
                  <Link href="/admin/posts/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" /> Create Post
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post: AuthorPost) => (
                  <Card key={post.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{post.title}</h3>
                          {post.isPublished ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                          <span>{post.category || "Uncategorized"}</span>
                          <span className={post.isPublished ? "text-green-600" : "text-orange-500"}>
                            {post.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/posts/${post.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletePostMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">Portfolio Items</h2>
              <Link href="/admin/portfolio/new">
                <Button data-testid="button-new-portfolio">
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </Link>
            </div>

            {portfolioLoading ? (
              <p className="text-muted-foreground">Loading portfolio...</p>
            ) : portfolioItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                  <CardTitle className="mb-2">No portfolio items yet</CardTitle>
                  <CardDescription className="mb-4">Add your first portfolio item to showcase your work</CardDescription>
                  <Link href="/admin/portfolio/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioItems.map((item: AuthorPortfolio) => (
                  <Card key={item.id} className="hover:border-primary/50 transition-colors overflow-hidden">
                    {item.imageUrl && (
                      <div className="aspect-video bg-muted">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">{item.title}</h3>
                        {item.isPublished ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>{item.category || "Project"}</span>
                        <span>{item.year}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link href={`/admin/portfolio/${item.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          disabled={deletePortfolioMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
