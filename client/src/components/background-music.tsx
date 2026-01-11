import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Music } from "lucide-react";
import { useAnnouncement } from "@/hooks/use-announcement";

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function BackgroundMusic() {
  const { data } = useQuery<{ musicUrl: string }>({
    queryKey: ["/api/settings/music"],
  });
  const { hasAnnouncement } = useAnnouncement();

  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const musicUrl = data?.musicUrl || "";
  const youtubeId = musicUrl ? extractYoutubeId(musicUrl) : null;

  if (!youtubeId) {
    return null;
  }

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (iframeRef.current) {
      const message = isMuted 
        ? '{"event":"command","func":"unMute","args":""}' 
        : '{"event":"command","func":"mute","args":""}';
      iframeRef.current.contentWindow?.postMessage(message, '*');
    }
  };

  const bannerHeight = "min(100vw * 106 / 740, 106px)";
  const topOffset = hasAnnouncement 
    ? `calc(92px + ${bannerHeight})` 
    : `calc(52px + ${bannerHeight})`;

  return (
    <>
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&mute=0&enablejsapi=1&controls=0`}
        className="hidden"
        allow="autoplay"
        title="Background Music"
      />
      
      <div 
        className="fixed left-0 right-0 z-20 flex items-center justify-center gap-2 px-4 py-1 bg-black/80 backdrop-blur-sm border-b border-primary/20"
        style={{ top: topOffset }}
        data-testid="music-player-bar"
      >
        <Music className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-xs text-primary/80 font-medium">
          Muzik Caliniyor
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="h-6 px-2 text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
          data-testid="button-music-toggle"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3 h-3 mr-1" />
              Sesi Ac
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3 mr-1" />
              Sesi Kapat
            </>
          )}
        </Button>
      </div>
    </>
  );
}
