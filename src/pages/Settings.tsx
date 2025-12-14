import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Bell, Palette, Edit, Settings as SettingsIcon, ChevronRight, Shield, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const Settings = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-mesh pb-20 md:pb-4 md:pt-20">
        <Navbar />
        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-mesh pb-20 md:pb-4 md:pt-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-display">Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-4">
          {/* Profile Card */}
          <Card className="p-5 glass border-0 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
                <User className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold font-display text-lg">{user?.email}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Account verified
                </p>
              </div>
            </div>
          </Card>

          {/* Settings Options */}
          <Card className="divide-y divide-border/50 overflow-hidden border-0 shadow-card">
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Edit className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Stock Preferences</p>
                <p className="text-sm text-muted-foreground">Update your tracked stocks</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            <button
              className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-all duration-200 group"
              onClick={() => {
                toast({
                  title: 'Coming soon',
                  description: 'Notification settings will be available soon.',
                });
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-fintech-gold/10 flex items-center justify-center group-hover:bg-fintech-gold/20 transition-colors">
                <Bell className="w-5 h-5 text-fintech-gold" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Manage alert preferences</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            <button
              className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-all duration-200 group"
              onClick={() => {
                toast({
                  title: 'Coming soon',
                  description: 'Theme settings will be available soon.',
                });
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-fintech-purple/10 flex items-center justify-center group-hover:bg-fintech-purple/20 transition-colors">
                <Palette className="w-5 h-5 text-fintech-purple" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Appearance</p>
                <p className="text-sm text-muted-foreground">Light or dark mode</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </Card>

          {/* About Card */}
          <Card className="p-5 border-0 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="font-semibold font-display">About MarketPulse</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Version 1.0.0 - AI-powered market intelligence for Indian stocks
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Privacy Policy
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Terms of Service
              </Button>
            </div>
          </Card>

          {/* Sign Out */}
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full h-12"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>

      <FeedbackWidget screenName="settings" />
    </div>
  );
};

export default Settings;