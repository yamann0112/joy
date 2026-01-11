import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/role-badge";
import type { UserRoleType } from "@shared/schema";
import { Calendar, MessageSquare, Crown, Ticket, Film, Users } from "lucide-react";
import { Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { useAnnouncement } from "@/hooks/use-announcement";
import { BannerCarousel } from "@/components/banner-carousel";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasAnnouncement } = useAnnouncement();

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

  const userRole = (user?.role as UserRoleType) || "USER";
  const canAccessVip = userRole === "VIP" || userRole === "MOD" || userRole === "ADMIN";

  return (
    <div className={`min-h-screen bg-background ${hasAnnouncement ? "pt-10" : ""}`}>
      <div className="pt-4 pb-2 px-4">
        <BannerCarousel />
      </div>
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Hoş Geldiniz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-card-border">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {user?.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{user?.displayName}</h3>
                  <p className="text-sm text-muted-foreground">@{user?.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <RoleBadge role={userRole} />
                    <Badge variant="outline">Level {user?.level || 1}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Seviye Ilerlemesi</span>
                  <span className="text-primary font-medium">{((user?.level || 1) % 10) * 10}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full gold-gradient rounded-full transition-all duration-500"
                    style={{ width: `${((user?.level || 1) % 10) * 10}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Hizli Erisim</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Link href="/events">
                <Button variant="outline" className="w-full h-16 flex-col gap-1" data-testid="quick-link-events">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-xs">Etkinlikler</span>
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" className="w-full h-16 flex-col gap-1" data-testid="quick-link-chat">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="text-xs">Sohbet</span>
                </Button>
              </Link>
              <Link href="/film">
                <Button variant="outline" className="w-full h-16 flex-col gap-1" data-testid="quick-link-film">
                  <Film className="w-5 h-5 text-primary" />
                  <span className="text-xs">Film</span>
                </Button>
              </Link>
              <Link href="/tickets">
                <Button variant="outline" className="w-full h-16 flex-col gap-1" data-testid="quick-link-tickets">
                  <Ticket className="w-5 h-5 text-primary" />
                  <span className="text-xs">Destek</span>
                </Button>
              </Link>
              {canAccessVip && (
                <Link href="/vip">
                  <Button variant="outline" className="w-full h-16 flex-col gap-1 col-span-2 border-primary/50" data-testid="quick-link-vip">
                    <Crown className="w-5 h-5 text-primary" />
                    <span className="text-xs">VIP Uygulamalar</span>
                  </Button>
                </Link>
              )}
              <Link href="/users">
                <Button variant="outline" className="w-full h-16 flex-col gap-1 col-span-2" data-testid="quick-link-users">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-xs">Kullanicilar</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
