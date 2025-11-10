import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyses();
  }, []);

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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading analyses...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No analyses yet. Upload a chart to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
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

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString()} at{' '}
                      {new Date(analysis.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
