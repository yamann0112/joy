import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Announcement } from "@shared/schema";
import { Crown, Shield, Users, MessageSquare, Calendar, Sparkles, ArrowRight, Star, Zap, LogIn } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "PK Etkinlikleri",
    description: "Canli yayinlar ve ozel etkinliklere katilin",
  },
  {
    icon: MessageSquare,
    title: "Grup Sohbetleri",
    description: "Ajans gruplarinda yazili sohbet edin",
  },
  {
    icon: Users,
    title: "Elit Topluluk",
    description: "VIP ve ozel uyelerle tanisin",
  },
  {
    icon: Shield,
    title: "Guvenli Platform",
    description: "Moderator destekli guvenli ortam",
  },
];

function AnnouncementMarquee() {
  const { data: announcement, isLoading } = useQuery<Announcement | null>({
    queryKey: ["/api/announcements/active"],
    queryFn: async () => {
      const res = await fetch("/api/announcements/active");
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (isLoading || !announcement) return null;

  return (
    <div className="bg-primary/10 border-y border-primary/30 py-3 overflow-hidden">
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

function QuickLoginBox() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const user = await response.json();
      login(user);
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Giris yapilamadi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Kullanici"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-28 h-8 text-sm"
        data-testid="input-quick-username"
      />
      <Input
        type="password"
        placeholder="Sifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-28 h-8 text-sm"
        data-testid="input-quick-password"
      />
      <Button 
        type="submit" 
        size="sm" 
        disabled={isLoading || !username || !password}
        className="h-8"
        data-testid="button-quick-login"
      >
        <LogIn className="w-4 h-4" />
      </Button>
    </form>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Link href="/dashboard">
          <Button className="gap-2">
            Dashboard'a Git <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-gradient-gold">JOY</span>
          </div>
          <QuickLoginBox />
        </div>
      </header>

      <main className="flex-1 pt-16">
        <AnnouncementMarquee />

        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-background to-background" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Ajans Platformu</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-foreground">Elit Toplulukta</span>
              <br />
              <span className="text-gradient-gold">Yerinizi Alin</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              PK etkinlikleri, ozel sohbet gruplari ve VIP avantajlariyla
              dolu premium ajans platformuna hos geldiniz.
            </p>

            <p className="text-sm text-muted-foreground mt-6">
              Hesabiniz yok mu? Admin ile iletisime gecin.
            </p>

            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span>1000+ Uye</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>50+ Ajans</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Gunluk Etkinlik</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-gradient-gold">Ozellikler</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                JOY size en iyi deneyimi sunmak icin tasarlandi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 border-t-2 border-t-primary/50 hover-elevate transition-all duration-300"
                  data-testid={`feature-card-${index}`}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-card/50">
          <div className="max-w-4xl mx-auto text-center">
            <Crown className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-gold">Premium Deneyim</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              VIP uyelik ile ozel avantajlara erisin, etkinliklere oncelikli katilin
              ve premium destek alin.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
              <Crown className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-gradient-gold">JOY</span>
          </div>
          <p className="text-sm text-muted-foreground">
            2024 JOY. Tum haklari saklidir.
          </p>
        </div>
      </footer>
    </div>
  );
}
