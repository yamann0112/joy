import { useState, useEffect } from "react";
import { Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { UserRoleType } from "@shared/schema";

export function TopBar() {
  const [isDark, setIsDark] = useState(true);
  const [topOffset, setTopOffset] = useState(16);
  const { hasAnnouncement } = useAnnouncement();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("joy_theme");
    const prefersDark = savedTheme !== "light";
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    setTopOffset(hasAnnouncement ? 44 : 16);
  }, [hasAnnouncement]);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("joy_theme", newTheme);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className="fixed right-4 z-[60] flex items-center gap-2"
      style={{ top: `${topOffset}px` }}
    >
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
  );
}
