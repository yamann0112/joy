import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RoleBadge } from "@/components/role-badge";
import type { UserRoleType } from "@shared/schema";
import { User, Camera, Shield, Bell, Lock, Palette, Film, Save, Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import { useAnnouncement } from "@/hooks/use-announcement";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { hasAnnouncement } = useAnnouncement();
  const { toast } = useToast();
  const [filmUrl, setFilmUrl] = useState("");
  
  const isAdmin = user?.role === "ADMIN";
  
  const { data: filmSettings } = useQuery({
    queryKey: ["/api/settings/film"],
    queryFn: async () => {
      const res = await fetch("/api/settings/film", { credentials: "include" });
      if (!res.ok) return { filmUrl: "" };
      return res.json();
    },
    enabled: isAuthenticated && isAdmin,
  });
  
  useEffect(() => {
    if (filmSettings?.filmUrl) {
      setFilmUrl(filmSettings.filmUrl);
    }
  }, [filmSettings]);
  
  const saveFilmMutation = useMutation({
    mutationFn: async (url: string) => {
      return apiRequest("POST", "/api/settings/film", { filmUrl: url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/film"] });
      toast({ title: "Basarili", description: "Film URL kaydedildi" });
    },
    onError: (error: any) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className={`min-h-screen bg-background ${hasAnnouncement ? "pt-10" : ""}`}>
      <HamburgerMenu />

      <main className="max-w-3xl mx-auto px-4 py-6 pl-16 sm:pl-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profil Bilgileri
            </CardTitle>
            <CardDescription>Profil bilgilerinizi güncelleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-primary">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {user?.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
                  data-testid="button-change-avatar"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{user?.displayName}</h3>
                <p className="text-sm text-muted-foreground">@{user?.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <RoleBadge role={(user?.role as UserRoleType) || "USER"} />
                  <span className="text-sm text-muted-foreground">Level {user?.level}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="displayName">Görünen İsim</Label>
                <Input
                  id="displayName"
                  defaultValue={user?.displayName}
                  data-testid="input-settings-display-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  defaultValue={user?.username}
                  disabled
                  className="bg-muted"
                  data-testid="input-settings-username"
                />
                <p className="text-xs text-muted-foreground">
                  Kullanıcı adı değiştirilemez
                </p>
              </div>
            </div>

            <Button data-testid="button-save-profile">Değişiklikleri Kaydet</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Güvenlik
            </CardTitle>
            <CardDescription>Şifre ve güvenlik ayarları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Mevcut Şifre</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                data-testid="input-current-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                data-testid="input-new-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                data-testid="input-confirm-password"
              />
            </div>
            <Button variant="outline" data-testid="button-change-password">
              Şifreyi Değiştir
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Bildirimler
            </CardTitle>
            <CardDescription>Bildirim tercihlerinizi yönetin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Etkinlik Bildirimleri</p>
                  <p className="text-sm text-muted-foreground">
                    Yeni etkinliklerden haberdar olun
                  </p>
                </div>
                <Button variant="outline" size="sm" data-testid="toggle-event-notifications">
                  Açık
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mesaj Bildirimleri</p>
                  <p className="text-sm text-muted-foreground">
                    Yeni mesajlardan haberdar olun
                  </p>
                </div>
                <Button variant="outline" size="sm" data-testid="toggle-message-notifications">
                  Açık
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Görünüm
            </CardTitle>
            <CardDescription>Tema ve görünüm ayarları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema</p>
                <p className="text-sm text-muted-foreground">
                  Platform temasını seçin
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-background"
                  data-testid="button-theme-dark"
                >
                  Koyu
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                Film Ayarları
              </CardTitle>
              <CardDescription>Film sayfasında gösterilecek video URL'si (Admin)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="filmUrl">Video URL (Embed)</Label>
                <Input
                  id="filmUrl"
                  placeholder="https://www.youtube.com/embed/..."
                  value={filmUrl}
                  onChange={(e) => setFilmUrl(e.target.value)}
                  data-testid="input-film-url"
                />
                <p className="text-xs text-muted-foreground">
                  YouTube, Vimeo veya baska bir embed URL girebilirsiniz
                </p>
              </div>
              <Button
                onClick={() => saveFilmMutation.mutate(filmUrl)}
                disabled={saveFilmMutation.isPending}
                data-testid="button-save-film-url"
              >
                {saveFilmMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
