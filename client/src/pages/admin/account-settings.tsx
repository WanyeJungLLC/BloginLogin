import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, Lock, User, Home, Settings, LogOut } from "lucide-react";

export default function AccountSettings() {
  const { user, loading: authLoading, changePassword, changeCredentials, refreshUser, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setLocation("/admin/login");
  };

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [credentialsPassword, setCredentialsPassword] = useState("");
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [credentialsError, setCredentialsError] = useState("");
  const [credentialsSuccess, setCredentialsSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (user) {
      setNewUsername(user.username || "");
      setNewEmail(user.recoveryEmail || "");
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError("");
    setCredentialsSuccess("");
    setCredentialsLoading(true);

    try {
      const updates: { newUsername?: string; newEmail?: string } = {};
      if (newUsername !== user.username) {
        updates.newUsername = newUsername;
      }
      if (newEmail !== user.recoveryEmail) {
        updates.newEmail = newEmail;
      }

      if (Object.keys(updates).length === 0) {
        setCredentialsError("No changes to save");
        setCredentialsLoading(false);
        return;
      }

      await changeCredentials(credentialsPassword, updates.newUsername, updates.newEmail);
      setCredentialsSuccess("Credentials updated successfully");
      setCredentialsPassword("");
      await refreshUser();
    } catch (err: any) {
      setCredentialsError(err.message || "Failed to update credentials");
    } finally {
      setCredentialsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
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

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="font-serif text-3xl">Account Settings</h1>
        <p className="text-muted-foreground">Logged in as: {user.username}</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Account Credentials
            </CardTitle>
            <CardDescription>Update your username or recovery email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newUsername">Username</Label>
                <Input
                  id="newUsername"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="username"
                  required
                  data-testid="input-new-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEmail">Recovery Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="recovery@email.com"
                  required
                  data-testid="input-new-email"
                />
                <p className="text-xs text-muted-foreground">Used for password recovery</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="credentialsPassword">Current Password</Label>
                <Input
                  id="credentialsPassword"
                  type="password"
                  value={credentialsPassword}
                  onChange={(e) => setCredentialsPassword(e.target.value)}
                  placeholder="Enter current password to confirm"
                  required
                  data-testid="input-credentials-password"
                />
              </div>
              {credentialsError && <p className="text-sm text-destructive">{credentialsError}</p>}
              {credentialsSuccess && <p className="text-sm text-green-600">{credentialsSuccess}</p>}
              <Button type="submit" disabled={credentialsLoading} data-testid="button-update-credentials">
                {credentialsLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Credentials
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" /> Change Password
            </CardTitle>
            <CardDescription>Update your account password (recommended regularly)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  required
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  data-testid="input-confirm-password"
                />
              </div>
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}
              <Button type="submit" disabled={passwordLoading} data-testid="button-update-password">
                {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
