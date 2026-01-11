import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Users, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import type { ChatGroup, ChatMessage, User } from "@shared/schema";

interface MessageWithUser extends ChatMessage {
  user?: User;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [message, setMessage] = useState("");
  const { user, isAuthenticated } = useAuth();

  const { data: groups = [] } = useQuery<ChatGroup[]>({
    queryKey: ["/api/chat/groups"],
    enabled: isAuthenticated && isOpen,
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
    enabled: !!selectedGroup && isOpen,
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

  if (!isAuthenticated) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg gold-gradient hover:opacity-90"
        data-testid="button-floating-chat"
      >
        <MessageCircle className="w-6 h-6 text-black" />
      </Button>

      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-80 h-96 shadow-2xl border-primary/30 flex flex-col">
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
                setIsOpen(false);
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
                                ? "bg-[#056162] text-white rounded-tr-none"
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
