import { Outlet } from "react-router-dom";
import { useRef, useEffect } from "react";
import { Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import cosmicHero from "@/assets/cosmic-hero.jpg";

const MainLayout = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        heroRef.current.style.transform = `translate3d(0, ${parallax}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        <div 
          ref={heroRef}
          className="absolute inset-0 w-full h-[120%] bg-cover bg-center bg-no-repeat will-change-transform"
          style={{ backgroundImage: `url(${cosmicHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4 max-w-4xl mx-auto px-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
                <h1 className="text-5xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
                  PRD Genie
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Transform your app ideas into comprehensive, professional Product Requirements Documents using advanced AI. Get real PRDs, not templates.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <Badge variant="outline" className="text-sm">
                  <Zap className="w-3 h-3 mr-1" />
                  Real AI PRDs
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Designer & Engineer Personas
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Multiple AI Models
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 bg-background min-h-screen">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>PRD Genie - AI-powered Product Requirements Document assistant</p>
            <p className="mt-2">Built with React, TypeScript, and modern web technologies</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;