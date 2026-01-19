import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BlogPost from "@/pages/blog-post";
import Journal from "@/pages/journal";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import PostEditor from "@/pages/admin/post-editor";
import PortfolioEditor from "@/pages/admin/portfolio-editor";
import AccountSettings from "@/pages/admin/account-settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/journal" component={Journal} />
      <Route path="/journal/:id" component={BlogPost} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/posts/:id" component={PostEditor} />
      <Route path="/admin/portfolio/:id" component={PortfolioEditor} />
      <Route path="/admin/settings" component={AccountSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
