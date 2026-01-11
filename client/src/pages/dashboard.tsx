import { useAuth } from "@/lib/auth-context";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { StatCard, StatCardSkeleton } from "@/components/stat-card";
import { EventCard, EventCardSkeleton } from "@/components/event-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/role-badge";
import { useQuery } from "@tanstack/react-query";
import type { Event, User, UserRoleType, Announcement } from "@shared/schema";
import { Calendar, MessageSquare, Users, Ticket, Crown, Sparkles } from "lucide-react";
import { Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";

function AnnouncementMarquee() {
  const { data: announcement, isLoading } = useQuery<Announcement | null>({
    queryKey: ["/api/announcements/active"],
    queryFn: async () => {
      const res = await fetch("/api/announcements/active", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (isLoading || !announcement) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/30 py-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
        <div className="flex items-center gap-4 text-primary font-medium px-4">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <span>{announcement.content}</span>
        </div>
        <div className="flex items-center gap-4 text-primary font-medium px-4">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <span>{announcement.content}</span>
        </div>
        <div className="flex items-center gap-4 text-primary font-medium px-4">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <span>{announcement.content}</span>
        </div>
        <div className="flex items-center gap-4 text-primary font-medium px-4">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <span>{announcement.content}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery<{
    totalUsers: number;
    totalEvents: number;
    totalMessages: number;
    totalTickets: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
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

  const upcomingEvents = events?.slice(0, 3) || [];
  const liveEvents = events?.filter((e) => e.isLive) || [];

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />

      <AnnouncementMarquee />

      <header className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 py-4 pl-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gradient-gold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Hoş geldiniz, {user?.displayName}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-medium">{user?.displayName}</p>
                <RoleBadge role={(user?.role as UserRoleType) || "USER"} size="sm" />
              </div>
              <Avatar className="w-10 h-10 border-2 border-primary">
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user?.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pl-16 sm:pl-4 space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            İstatistikler
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats ? (
              <>
                <StatCard title="Toplam Üye" value={stats.totalUsers} icon={Users} />
                <StatCard title="Etkinlikler" value={stats.totalEvents} icon={Calendar} />
                <StatCard title="Mesajlar" value={stats.totalMessages} icon={MessageSquare} />
                <StatCard title="Destek Talepleri" value={stats.totalTickets} icon={Ticket} />
              </>
            ) : (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            )}
          </div>
        </section>

        {liveEvents.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Canlı Yayınlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Yaklaşan Etkinlikler
            </h2>
            <Link href="/events">
              <Button variant="ghost" size="sm" data-testid="button-view-all-events">
                Tümünü Gör
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventsLoading ? (
              <>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <Card className="col-span-full p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz etkinlik bulunmuyor</p>
              </Card>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Hızlı Erişim</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Link href="/events">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="quick-link-events">
                  <Calendar className="w-6 h-6 text-primary" />
                  <span>Etkinlikler</span>
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="quick-link-chat">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <span>Sohbet</span>
                </Button>
              </Link>
              <Link href="/tickets">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="quick-link-tickets">
                  <Ticket className="w-6 h-6 text-primary" />
                  <span>Destek</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="quick-link-settings">
                  <Crown className="w-6 h-6 text-primary" />
                  <span>Profil</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Profil Durumu</CardTitle>
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
                    <RoleBadge role={(user?.role as UserRoleType) || "USER"} />
                    <Badge variant="outline">Level {user?.level || 1}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Seviye İlerlemesi</span>
                  <span className="text-primary font-medium">{((user?.level || 1) % 10) * 10}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${((user?.level || 1) % 10) * 10}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
