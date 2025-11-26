import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Bell, Palette, Edit } from 'lucide-react';
import { useEffect } from 'react';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4 md:pt-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-accent-foreground">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Account</p>
              </div>
            </div>
          </Card>

          <Card className="divide-y divide-border">
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <Edit className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">Stock Preferences</p>
                <p className="text-sm text-muted-foreground">Update your tracked stocks</p>
              </div>
            </button>

            <button
              className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              onClick={() => {
                toast({
                  title: 'Coming soon',
                  description: 'Notification settings will be available soon.',
                });
              }}
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Manage alert preferences</p>
              </div>
            </button>

            <button
              className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              onClick={() => {
                toast({
                  title: 'Coming soon',
                  description: 'Theme settings will be available soon.',
                });
              }}
            >
              <Palette className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-medium">Appearance</p>
                <p className="text-sm text-muted-foreground">Light or dark mode</p>
              </div>
            </button>
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold mb-2">About MarketPulse</h2>
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

          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
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
