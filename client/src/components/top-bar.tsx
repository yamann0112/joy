import { useState, useEffect } from "react";
import { Moon, Sun, User, MessageCircle, X, Send, Users, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useAnnouncement } from "@/hooks/use-announcement";
import { RoleBadge } from "@/components/role-badge";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserRoleType } from "@shared/schema";
import type { ChatGroup, ChatMessage, User as UserType } from "@shared/schema";

interface MessageWithUser extends ChatMessage {
  user?: UserType;
}

export function TopBar() {
  const [isDark, setIsDark] = useState(true);
  const [topOffset, setTopOffset] = useState(16);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [message, setMessage] = useState("");
  const { hasAnnouncement } = useAnnouncement();
  const { user, isAuthenticated, logout } = useAuth();

  const { data: groups = [] } = useQuery<ChatGroup[]>({
    queryKey: ["/api/chat/groups"],
    enabled: isAuthenticated && isChatOpen,
    refetchInterval: 10000,
  });

  const { data: messages = [] } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/chat/groups", selectedGroup?.id, "messages"],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const res = await fetch(`/api/chat/groups/${selectedGroup.id}/messages`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedGroup && isChatOpen,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedGroup) return;
      return apiRequest("POST", `/api/chat/groups/${selectedGroup.id}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/groups", selectedGroup?.id, "messages"] });
      setMessage("");
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("joy_theme");
    const prefersDark = savedTheme !== "light";
    setIsDark(prefersDark);
    
    if (prefersDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, []);

  useEffect(() => {
    setTopOffset(hasAnnouncement ? 44 : 16);
  }, [hasAnnouncement]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    
    localStorage.setItem("joy_theme", newIsDark ? "dark" : "light");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div
        className="fixed right-4 z-[60] flex items-center gap-2"
        style={{ top: `${topOffset}px` }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsChatOpen(true)}
          className="bg-background/95 border-primary/50 shadow-lg hover:bg-primary/20"
          data-testid="button-chat"
        >
          <MessageCircle className="w-5 h-5 text-primary" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="bg-background/95 border-primary/50 shadow-lg hover:bg-primary/20"
          data-testid="button-theme-toggle"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-primary" />
          ) : (
            <Moon className="w-5 h-5 text-primary" />
          )}
        </Button>

        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-background/95 border-primary/50 shadow-lg hover:bg-primary/20 p-0 overflow-hidden"
            data-testid="button-profile-menu"
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-10 h-10 border border-primary/30">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {user?.displayName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadge role={(user?.role as UserRoleType) || "USER"} />
                <span className="text-xs text-muted-foreground">Level {user?.level}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profil Ayarlari
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="text-destructive focus:text-destructive cursor-pointer"
            data-testid="menu-item-logout"
          >
            Cikis Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isChatOpen && (
        <Card className="fixed top-16 right-4 z-50 w-80 h-96 shadow-2xl border-primary/30 flex flex-col">
          <CardHeader className="p-3 border-b flex flex-row items-center gap-2">
            {selectedGroup && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedGroup(null)}
                className="h-8 w-8"
                data-testid="button-back-groups"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <CardTitle className="text-sm flex-1">
              {selectedGroup ? selectedGroup.name : "Canli Sohbet"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsChatOpen(false);
                setSelectedGroup(null);
              }}
              className="h-8 w-8"
              data-testid="button-close-chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
            {!selectedGroup ? (
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {groups.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Henuz grup yok
                    </p>
                  ) : (
                    groups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => setSelectedGroup(group)}
                        className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                        data-testid={`chat-group-${group.id}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{group.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {group.description || "Sohbet grubu"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            ) : (
              <>
                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.userId === user?.id ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="text-xs bg-primary/20 text-primary">
                            {msg.user?.displayName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[85%] ${msg.userId === user?.id ? "text-right" : ""}`}>
                          {msg.userId !== user?.id && (
                            <p className="text-[10px] font-bold text-primary mb-0.5 ml-1">
                              {msg.user?.displayName || "Kullanici"}
                            </p>
                          )}
                          <div
                            className={`p-2 rounded-2xl text-sm shadow-sm relative ${
                              msg.userId === user?.id
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted text-foreground rounded-tl-none"
                            }`}
                          >
                            {msg.content}
                            <div className="flex justify-end mt-0.5 -mb-0.5 ml-2">
                               <span className="text-[9px] opacity-70">
                                 {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-2 border-t flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mesaj yaz..."
                    className="flex-1 h-8 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    data-testid="input-chat-message"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!message.trim() || sendMutation.isPending}
                    className="h-8 w-8"
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
