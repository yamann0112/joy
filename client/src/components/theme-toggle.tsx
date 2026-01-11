import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnnouncement } from "@/hooks/use-announcement";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const { hasAnnouncement } = useAnnouncement();

  useEffect(() => {
    const savedTheme = localStorage.getItem("joy_theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? "dark" : "light";
    setIsDark(!isDark);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("joy_theme", newTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed right-4 z-[60] bg-background/95 border-primary/50 shadow-lg hover:bg-primary/20"
      style={{ top: hasAnnouncement ? "44px" : "16px" }}
      data-testid="button-theme-toggle"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-primary" />
      ) : (
        <Moon className="w-5 h-5 text-primary" />
      )}
    </Button>
  );
}
