import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Upload, Home, Settings, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPost, createPost, updatePost } from "@/lib/api";
import ImageUpload from "@/components/image-upload";
import MarkdownEditor from "@/components/markdown-editor";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PostEditor() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setLocation("/admin/login");
  };
  const [match, params] = useRoute("/admin/posts/:id");
  const isNew = params?.id === "new";
  const postId = isNew ? null : params?.id;
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [contentFormat, setContentFormat] = useState<"markdown" | "html">("markdown");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState("");

  const { data: existingPost, isLoading: postLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postId ? getPost(postId) : null,
    enabled: !!postId
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setSlug(existingPost.slug);
      setExcerpt(existingPost.excerpt || "");
      setContent(existingPost.content);
      setContentFormat((existingPost as any).contentFormat || "html");
      setCategory(existingPost.category || "");
      setImage(existingPost.featuredImageUrl || "");
      setIsPublished(existingPost.isPublished);
    }
  }, [existingPost]);

  useEffect(() => {
    if (isNew && title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, isNew, slug]);

  if (authLoading || (postId && postLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleInsertImage = () => {
    setShowImageDialog(true);
  };

  const handleImageSelected = (url: string) => {
    const markdownImage = `![Image](${url})\n`;
    setContent((prev) => prev + markdownImage);
    setShowImageDialog(false);
    setInlineImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    const readTimeMinutes = Math.max(1, Math.ceil(content.split(' ').length / 200));

    const postData = {
      title,
      slug: slug || generateSlug(title),
      excerpt,
      content,
      contentFormat,
      category,
      featuredImageUrl: image || null,
      isPublished,
      readTimeMinutes,
      publishedAt: isPublished && !existingPost?.publishedAt ? new Date() : existingPost?.publishedAt,
    };

    try {
      if (isNew) {
        await createPost(postData);
      } else if (postId) {
        await updatePost(postId, postData);
      }
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setLocation("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to save post");
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

      <main className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              {isNew ? "Create New Post" : "Edit Post"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title..."
                    required
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="post-url-slug"
                    required
                    data-testid="input-slug"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL: /journal/{slug || "post-slug"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Design Theory"
                    data-testid="input-category"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  <ImageUpload
                    value={image}
                    onChange={setImage}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A brief summary of your post..."
                  rows={2}
                  data-testid="input-excerpt"
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  onInsertImage={handleInsertImage}
                  placeholder="Write your blog post content in Markdown..."
                  minHeight="500px"
                />
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Switch
                  id="published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                  data-testid="switch-published"
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
                  data-testid="button-save"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Post
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

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload an image or enter a URL to insert into your post.
            </p>
            <ImageUpload
              value={inlineImageUrl}
              onChange={(url) => {
                setInlineImageUrl(url);
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowImageDialog(false);
                  setInlineImageUrl("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleImageSelected(inlineImageUrl)}
                disabled={!inlineImageUrl}
              >
                <Upload className="w-4 h-4 mr-2" />
                Insert Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
