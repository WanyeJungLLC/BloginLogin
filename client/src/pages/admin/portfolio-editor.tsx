import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Home, Settings, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPortfolioItem, createPortfolioItem, updatePortfolioItem } from "@/lib/api";
import ImageUpload from "@/components/image-upload";
import { Switch } from "@/components/ui/switch";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PortfolioEditor() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setLocation("/admin/login");
  };
  const [match, params] = useRoute("/admin/portfolio/:id");
  const isNew = params?.id === "new";
  const itemId = isNew ? null : params?.id;
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [image, setImage] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const { data: existingItem, isLoading: itemLoading } = useQuery({
    queryKey: ['portfolio-item', itemId],
    queryFn: () => itemId ? getPortfolioItem(itemId) : null,
    enabled: !!itemId
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (existingItem) {
      setTitle(existingItem.title);
      setSlug(existingItem.slug);
      setDescription(existingItem.description || "");
      setCategory(existingItem.category || "");
      setYear(existingItem.year || new Date().getFullYear().toString());
      setImage(existingItem.imageUrl || "");
      setProjectUrl(existingItem.projectUrl || "");
      setIsPublished(existingItem.isPublished);
    }
  }, [existingItem]);

  useEffect(() => {
    if (isNew && title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, isNew, slug]);

  if (authLoading || (itemId && itemLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    const itemData = {
      title,
      slug: slug || generateSlug(title),
      description,
      category,
      year,
      imageUrl: image || null,
      projectUrl: projectUrl || null,
      isPublished,
    };

    try {
      if (isNew) {
        await createPortfolioItem(itemData);
      } else if (itemId) {
        await updatePortfolioItem(itemId, itemData);
      }
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] });
      setLocation("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to save portfolio item");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex-shrink-0 min-w-0">
            <h1 className="font-serif text-base sm:text-xl font-medium truncate">BloginLogin Admin</h1>
            <p className="text-xs text-muted-foreground">{user?.username}</p>
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

      <main className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              {isNew ? "Add Portfolio Item" : "Edit Portfolio Item"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project name..."
                  required
                  data-testid="input-portfolio-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="project-slug"
                  required
                  data-testid="input-portfolio-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Web Development, Brand Identity"
                  data-testid="input-portfolio-category"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2024"
                  data-testid="input-portfolio-year"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectUrl">Project URL (optional)</Label>
                <Input
                  id="projectUrl"
                  type="url"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://example.com"
                  data-testid="input-portfolio-url"
                />
              </div>

              <div className="space-y-2">
                <Label>Project Image</Label>
                <ImageUpload
                  value={image}
                  onChange={setImage}
                  disabled={isSaving}
                  bucket="portfolio-images"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the project..."
                  rows={4}
                  data-testid="input-portfolio-description"
                />
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Switch
                  id="published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                  data-testid="switch-portfolio-published"
                />
                <div className="flex items-center gap-2">
                  {isPublished ? (
                    <>
                      <Eye className="w-4 h-4 text-green-600" />
                      <Label htmlFor="published" className="text-green-600 font-medium">Published</Label>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="published" className="text-muted-foreground">Draft</Label>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive" data-testid="text-error">{error}</p>
              )}

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  data-testid="button-save-portfolio"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Item
                    </>
                  )}
                </Button>
                <Link href="/admin">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
