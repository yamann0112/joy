import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Calendar, MessageSquare, Users, Shield, Settings, LogOut, Ticket, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { UserRole, type UserRoleType } from "@shared/schema";

const getRoleBadgeStyle = (role: UserRoleType) => {
  switch (role) {
    case UserRole.ADMIN:
      return "bg-primary text-primary-foreground border-primary";
    case UserRole.MOD:
      return "bg-amber-600 text-white border-amber-500";
    case UserRole.VIP:
      return "bg-rose-600 text-white border-rose-500";
    default:
      return "bg-secondary text-secondary-foreground border-secondary";
  }
};

const getRoleIcon = (role: UserRoleType) => {
  switch (role) {
    case UserRole.ADMIN:
      return <Shield className="w-3 h-3" />;
    case UserRole.MOD:
      return <Star className="w-3 h-3" />;
    case UserRole.VIP:
      return <Crown className="w-3 h-3" />;
    default:
      return null;
  }
};

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function MenuItem({ href, icon, label, isActive, onClick }: MenuItemProps) {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover-elevate cursor-pointer ${
          isActive
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-foreground/80 hover:text-foreground"
        }`}
        data-testid={`menu-item-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {icon}
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
}

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const userRole = (user?.role as UserRoleType) || UserRole.USER;
  const canAccessAdmin = userRole === UserRole.ADMIN;
  const canAccessMod = userRole === UserRole.ADMIN || userRole === UserRole.MOD;

  const menuItems = [
    { href: "/dashboard", icon: <Home className="w-5 h-5" />, label: "Ana Sayfa", show: true },
    { href: "/events", icon: <Calendar className="w-5 h-5" />, label: "PK / Etkinlikler", show: true },
    { href: "/chat", icon: <MessageSquare className="w-5 h-5" />, label: "Sohbet", show: true },
    { href: "/tickets", icon: <Ticket className="w-5 h-5" />, label: "Destek", show: true },
    { href: "/management", icon: <Users className="w-5 h-5" />, label: "Yönetim", show: canAccessMod },
    { href: "/admin", icon: <Shield className="w-5 h-5" />, label: "Admin Panel", show: canAccessAdmin },
    { href: "/settings", icon: <Settings className="w-5 h-5" />, label: "Ayarlar", show: true },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50"
        data-testid="button-hamburger-menu"
      >
        <Menu className="w-6 h-6" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 fade-in"
          onClick={() => setIsOpen(false)}
          data-testid="menu-overlay"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 slide-in-left" : "-translate-x-full"
        }`}
        data-testid="sidebar-menu"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                <Crown className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-gradient-gold">PLATFORM</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-menu"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary">
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" data-testid="text-username">
                  {user?.displayName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getRoleBadgeStyle(userRole)}`}
                    data-testid="badge-user-role"
                  >
                    <span className="flex items-center gap-1">
                      {getRoleIcon(userRole)}
                      {userRole}
                    </span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Lvl {user?.level || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems
              .filter((item) => item.show)
              .map((item) => (
                <MenuItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={location === item.href}
                  onClick={() => setIsOpen(false)}
                />
              ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
