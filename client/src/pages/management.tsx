import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/role-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, ChatGroup, UserRoleType } from "@shared/schema";
import { Shield, Users, Plus, Trash2, Edit, Save, MessageSquare, Hash, UserPlus, UserMinus } from "lucide-react";
import { Redirect } from "wouter";

export default function Management() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });

  const isAdmin = user?.role === "ADMIN";
  const isMod = user?.role === "MOD";
  const canAccess = isAdmin || isMod;

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated && canAccess,
  });

  const { data: groups, isLoading: groupsLoading } = useQuery<ChatGroup[]>({
    queryKey: ["/api/chat/groups"],
    enabled: isAuthenticated && canAccess,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: typeof newGroup) => {
      const response = await apiRequest("POST", "/api/chat/groups", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/groups"] });
      setIsCreateGroupOpen(false);
      setNewGroup({ name: "", description: "" });
      toast({ title: "Basarili", description: "Grup olusturuldu" });
    },
    onError: (error: any) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/chat/groups/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/groups"] });
      toast({ title: "Basarili", description: "Grup silindi" });
    },
    onError: (error: any) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  const clearGroupMessagesMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiRequest("DELETE", `/api/chat/groups/${groupId}/messages`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      toast({ title: "Basarili", description: "Mesajlar temizlendi" });
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

  if (!canAccess) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />

      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 pl-16">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-gold">Yonetim</h1>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Admin Yonetim Paneli" : "Moderator Paneli"}
                </p>
              </div>
            </div>
            <RoleBadge role={(user?.role as UserRoleType) || "USER"} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pl-16 sm:pl-4 space-y-8">
        <Tabs defaultValue="users">
          <TabsList className="flex-wrap">
            <TabsTrigger value="users" data-testid="tab-mgmt-users">
              <Users className="w-4 h-4 mr-2" />
              Kullanicilar
            </TabsTrigger>
            {(isAdmin || isMod) && (
              <TabsTrigger value="groups" data-testid="tab-mgmt-groups">
                <MessageSquare className="w-4 h-4 mr-2" />
                Sohbet Gruplari
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Kullanici Listesi
                </CardTitle>
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
                        className="flex items-center gap-4 p-3 rounded-lg bg-card border border-card-border"
                        data-testid={`mgmt-user-row-${u.id}`}
                      >
                        <Avatar className="w-10 h-10 border border-primary/30">
                          <AvatarImage src={u.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {u.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">{u.displayName}</span>
                            <RoleBadge role={(u.role as UserRoleType) || "USER"} size="sm" />
                            {u.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">@{u.username}</span>
                        </div>
                        <Badge variant="outline">Level {u.level}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henuz kullanici yok</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-primary" />
                  Sohbet Grubu Yonetimi
                </CardTitle>
                <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-group">
                      <Plus className="w-4 h-4 mr-2" />
                      Grup Olustur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Sohbet Grubu</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Grup Adi</Label>
                        <Input
                          data-testid="input-group-name"
                          value={newGroup.name}
                          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                          placeholder="Grup adi"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Aciklama (Opsiyonel)</Label>
                        <Textarea
                          data-testid="input-group-description"
                          value={newGroup.description}
                          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                          placeholder="Grup aciklamasi"
                          rows={3}
                        />
                      </div>
                      <Button
                        className="w-full"
                        data-testid="button-submit-create-group"
                        onClick={() => createGroupMutation.mutate(newGroup)}
                        disabled={createGroupMutation.isPending || !newGroup.name.trim()}
                      >
                        {createGroupMutation.isPending ? "Olusturuluyor..." : "Grup Olustur"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {groupsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : groups && groups.length > 0 ? (
                  <div className="space-y-3">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between gap-4 p-4 rounded-lg bg-card border border-card-border"
                        data-testid={`group-item-${group.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Hash className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            {group.description && (
                              <p className="text-sm text-muted-foreground">{group.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Bu gruptaki tum mesajlari silmek istediginize emin misiniz?")) {
                                clearGroupMessagesMutation.mutate(group.id);
                              }
                            }}
                            data-testid={`button-clear-messages-${group.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Mesajlari Temizle
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm("Bu grubu silmek istediginize emin misiniz?")) {
                                  deleteGroupMutation.mutate(group.id);
                                }
                              }}
                              data-testid={`button-delete-group-${group.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henuz sohbet grubu yok</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
