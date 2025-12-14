import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, BarChart3, Settings, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: TrendingUp, label: 'Sentiment', path: '/sentiment' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Bookmark, label: 'Saved', path: '/bookmarks' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto">
      {/* Glassmorphism background */}
      <div className="glass border-t md:border-t-0 md:border-b border-border/50">
        <div className="container mx-auto">
          <div className="flex justify-around md:justify-center md:gap-2 py-2 px-2">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "relative flex flex-col md:flex-row items-center gap-1 px-4 py-2.5 rounded-xl transition-all duration-300",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-gradient-hero opacity-10" />
                  )}
                  <Icon className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  <span className={cn(
                    "text-xs md:text-sm font-medium transition-all duration-200",
                    isActive && "font-semibold"
                  )}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
