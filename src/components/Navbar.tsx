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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:top-0 md:bottom-auto">
      <div className="container mx-auto">
        <div className="flex justify-around md:justify-center md:gap-8 py-2">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                location.pathname === path
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs md:text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
