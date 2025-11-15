import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, LogOut, Trash2, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import type { User, Session } from '@supabase/supabase-js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface ChartAnalysis {
  id: string;
  image_url: string;
  bias: string;
  confidence: number;
  reasons: string[];
  best_move: string;
  created_at: string;
}

const History = () => {
  const [analyses, setAnalyses] = useState<ChartAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [biasFilter, setBiasFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      } else {
        fetchAnalyses();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('chart_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses((data || []) as ChartAnalysis[]);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBiasIcon = (bias: string) => {
    switch (bias.toLowerCase()) {
      case 'bullish':
        return <TrendingUp className="h-6 w-6" />;
      case 'bearish':
        return <TrendingDown className="h-6 w-6" />;
      default:
        return <Minus className="h-6 w-6" />;
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias.toLowerCase()) {
      case 'bullish':
        return 'text-green-500';
      case 'bearish':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('chart_analyses')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setAnalyses(analyses.filter(a => a.id !== deleteId));
      toast({
        title: "Analysis deleted",
        description: "The analysis has been removed from your history.",
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: "Error",
        description: "Failed to delete the analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (!user) {
    return null;
  }

  const filteredAnalyses = biasFilter === 'all' 
    ? analyses 
    : analyses.filter(a => a.bias.toLowerCase() === biasFilter);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold">Analysis History</h1>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={biasFilter} onValueChange={setBiasFilter}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Filter by bias" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All Analyses</SelectItem>
              <SelectItem value="bullish">Bullish</SelectItem>
              <SelectItem value="bearish">Bearish</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading analyses...</p>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {analyses.length === 0 
                ? "No analyses yet. Upload a chart to get started!" 
                : `No ${biasFilter} analyses found. Try a different filter.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="glass-card overflow-hidden">
                <img
                  src={analysis.image_url}
                  alt="Chart"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={getBiasColor(analysis.bias)}>
                      {getBiasIcon(analysis.bias)}
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">{analysis.bias}</h3>
                      <p className="text-sm text-muted-foreground">
                        {analysis.confidence.toFixed(2)}% confidence
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-sm">Key Points:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {analysis.reasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString()} at{' '}
                      {new Date(analysis.created_at).toLocaleTimeString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(analysis.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this analysis? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default History;
