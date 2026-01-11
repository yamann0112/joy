import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Banner } from "@shared/schema";

export function BannerCarousel() {
  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToNext = useCallback(() => {
    if (!banners || banners.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners]);

  const goToPrev = useCallback(() => {
    if (!banners || banners.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners]);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, [banners, goToNext]);

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[740px] mx-auto">
        <div className="w-full h-[106px] rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-[740px] mx-auto" data-testid="banner-carousel">
      <div 
        ref={containerRef}
        className="relative w-full h-[106px] rounded-xl overflow-hidden shadow-xl shadow-primary/20"
      >
        <div 
          className="flex h-full transition-transform duration-600 ease-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            transitionDuration: '600ms',
            transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex-shrink-0 w-full h-full relative"
              style={{ minWidth: '100%' }}
            >
              {banner.imageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.imageUrl})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                  <div className="absolute inset-0 gold-gradient opacity-10" />
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-primary/10 rounded-full blur-2xl" />
                </div>
              )}
              
              <div className="relative h-full flex items-center gap-4 px-4 py-2">
                <div className="flex-1 min-w-0">
                  {banner.title && (
                    <h2 className="text-lg md:text-xl font-bold text-white drop-shadow-lg truncate">
                      {banner.title}
                    </h2>
                  )}
                  {banner.description && (
                    <p className="text-white/80 text-xs md:text-sm max-w-md truncate">
                      {banner.description}
                    </p>
                  )}
                </div>
                {banner.ctaLabel && banner.ctaUrl && (
                  <Button
                    size="sm"
                    className="gold-gradient text-black font-semibold hover:opacity-90 shadow-lg flex-shrink-0"
                    onClick={() => window.open(banner.ctaUrl!, "_blank")}
                    data-testid="banner-cta-button"
                  >
                    {banner.ctaLabel}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 rounded-full w-6 h-6 border border-white/10"
              onClick={goToPrev}
              data-testid="banner-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 rounded-full w-6 h-6 border border-white/10"
              onClick={goToNext}
              data-testid="banner-next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsTransitioning(true);
                    setCurrentIndex(index);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-4"
                      : "bg-white/40 w-1 hover:bg-white/60"
                  }`}
                  data-testid={`banner-dot-${index}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
