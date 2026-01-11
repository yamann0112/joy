import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

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

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const musicUrl = data?.musicUrl || "";
  const youtubeId = musicUrl ? extractYoutubeId(musicUrl) : null;

  useEffect(() => {
    if (youtubeId && !isPlaying) {
      setIsPlaying(true);
    }
  }, [youtubeId]);

  if (!youtubeId) {
    return null;
  }

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (iframeRef.current) {
      const message = isMuted ? '{"event":"command","func":"unMute","args":""}' : '{"event":"command","func":"mute","args":""}';
      iframeRef.current.contentWindow?.postMessage(message, '*');
    }
  };

  return (
    <>
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&mute=1&enablejsapi=1&controls=0`}
        className="hidden"
        allow="autoplay"
        title="Background Music"
      />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="fixed bottom-4 right-4 z-50 bg-black/60 backdrop-blur-sm text-primary hover:bg-black/80 border border-primary/30 rounded-full w-10 h-10"
        data-testid="button-music-toggle"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </Button>
    </>
  );
}
