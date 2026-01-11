import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { Banner } from "@shared/schema";

export function BannerCarousel() {
  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToNext = useCallback(() => {
    if (!banners || banners.length <= 1 || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [banners, isAnimating]);

  const goToPrev = useCallback(() => {
    if (!banners || banners.length <= 1 || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [banners, isAnimating]);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [banners, goToNext]);

  if (isLoading) {
    return (
      <Card className="w-full h-64 md:h-80 animate-pulse">
        <CardContent className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const animationClass = currentBanner.animationType === "fade" 
    ? "animate-fade-in" 
    : currentBanner.animationType === "slide" 
    ? "animate-slide-in" 
    : currentBanner.animationType === "zoom"
    ? "animate-zoom-in"
    : "";

  return (
    <div className="relative w-full overflow-hidden rounded-xl" data-testid="banner-carousel">
      <div
        key={currentBanner.id}
        className={`relative w-full h-64 md:h-80 transition-all duration-500 ${animationClass}`}
      >
        {currentBanner.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 gold-gradient opacity-20" />
        )}
        
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 text-shadow-lg">
            {currentBanner.title}
          </h2>
          {currentBanner.description && (
            <p className="text-white/90 text-sm md:text-base mb-4 max-w-2xl">
              {currentBanner.description}
            </p>
          )}
          {currentBanner.ctaLabel && currentBanner.ctaUrl && (
            <div>
              <Button
                className="gold-gradient text-black font-semibold hover:opacity-90"
                onClick={() => window.open(currentBanner.ctaUrl!, "_blank")}
                data-testid="banner-cta-button"
              >
                {currentBanner.ctaLabel}
              </Button>
            </div>
          )}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full"
            onClick={goToPrev}
            data-testid="banner-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full"
            onClick={goToNext}
            data-testid="banner-next"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsAnimating(false), 500);
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-6"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                data-testid={`banner-dot-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
