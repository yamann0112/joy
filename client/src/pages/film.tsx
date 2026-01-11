import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Film, Play } from "lucide-react";
import { Redirect } from "wouter";
import { useAnnouncement } from "@/hooks/use-announcement";

interface FilmSettings {
  filmUrl: string;
}

export default function FilmPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasAnnouncement } = useAnnouncement();

  const { data: settings } = useQuery<FilmSettings>({
    queryKey: ["/api/settings/film"],
    queryFn: async () => {
      const res = await fetch("/api/settings/film", { credentials: "include" });
      if (!res.ok) return { filmUrl: "" };
      return res.json();
    },
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

  return (
    <div className={`min-h-screen bg-background ${hasAnnouncement ? "pt-10" : ""}`}>
      {settings?.filmUrl ? (
        <div className="fixed inset-0 bg-black z-[40]" style={{ top: hasAnnouncement ? "40px" : "0" }}>
          <iframe
            src={settings.filmUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            data-testid="film-iframe"
          />
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-6 pl-16 sm:pl-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
              <Film className="w-6 h-6" />
              Film
            </h1>
            <p className="text-sm text-muted-foreground">Guncel film ve videolar</p>
          </div>
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-muted-foreground">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Henuz film eklenmedi</p>
                <p className="text-sm mt-2">Admin film URL'si ekledikten sonra burada gorunecek</p>
              </div>
            </CardContent>
          </Card>
        </main>
      )}
    </div>
  );
}
