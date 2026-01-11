import { useAuth } from "@/lib/auth-context";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { StatCard, StatCardSkeleton } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/role-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import type { User, Event, Ticket, UserRoleType } from "@shared/schema";
import { Shield, Users, Calendar, Ticket as TicketIcon, MessageSquare, Settings, Crown, Activity } from "lucide-react";
import { Redirect } from "wouter";

export default function Admin() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const { data: stats } = useQuery<{
    totalUsers: number;
    totalEvents: number;
    totalMessages: number;
    totalTickets: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  const { data: recentTickets } = useQuery<Ticket[]>({
    queryKey: ["/api/admin/tickets/recent"],
    enabled: isAuthenticated && user?.role === "ADMIN",
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

  if (user?.role !== "ADMIN") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />

      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 pl-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-gold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Platform yönetimi</p>
              </div>
            </div>
            <RoleBadge role="ADMIN" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pl-16 sm:pl-4 space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Platform İstatistikleri
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats ? (
              <>
                <StatCard title="Toplam Üye" value={stats.totalUsers} icon={Users} />
                <StatCard title="Etkinlikler" value={stats.totalEvents} icon={Calendar} />
                <StatCard title="Mesajlar" value={stats.totalMessages} icon={MessageSquare} />
                <StatCard title="Destek Talepleri" value={stats.totalTickets} icon={TicketIcon} />
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

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-admin-users">
              <Users className="w-4 h-4 mr-2" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="tickets" data-testid="tab-admin-tickets">
              <TicketIcon className="w-4 h-4 mr-2" />
              Talepler
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-admin-settings">
              <Settings className="w-4 h-4 mr-2" />
              Ayarlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Kullanıcı Yönetimi</CardTitle>
                <Button variant="outline" size="sm" data-testid="button-add-user">
                  Kullanıcı Ekle
                </Button>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-1/6 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="space-y-2">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-card border border-card-border hover-elevate"
                        data-testid={`user-row-${u.id}`}
                      >
                        <Avatar className="w-10 h-10 border border-primary/30">
                          <AvatarImage src={u.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {u.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{u.displayName}</span>
                            <RoleBadge role={(u.role as UserRoleType) || "USER"} size="sm" />
                          </div>
                          <span className="text-sm text-muted-foreground">@{u.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Level {u.level}</Badge>
                          <Button variant="ghost" size="sm" data-testid={`button-edit-user-${u.id}`}>
                            Düzenle
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz kullanıcı yok</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Destek Talepleri</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTickets && recentTickets.length > 0 ? (
                  <div className="space-y-2">
                    {recentTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-card border border-card-border hover-elevate cursor-pointer"
                        data-testid={`admin-ticket-${ticket.id}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TicketIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {ticket.message}
                          </p>
                        </div>
                        <Badge
                          className={
                            ticket.status === "open"
                              ? "bg-blue-500"
                              : ticket.status === "resolved"
                              ? "bg-green-500"
                              : "bg-muted"
                          }
                        >
                          {ticket.status === "open"
                            ? "Açık"
                            : ticket.status === "resolved"
                            ? "Çözüldü"
                            : ticket.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TicketIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz destek talebi yok</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Ayarları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 hover-elevate cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Rol Yönetimi</h4>
                        <p className="text-sm text-muted-foreground">
                          Kullanıcı rollerini düzenle
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 hover-elevate cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Genel Ayarlar</h4>
                        <p className="text-sm text-muted-foreground">
                          Platform ayarlarını yapılandır
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
