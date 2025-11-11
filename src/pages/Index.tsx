import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/components/UploadZone';
import { ResultsPanel } from '@/components/ResultsPanel';
import { Loader2, History, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { User, Session } from '@supabase/supabase-js';

interface AnalysisResult {
  bias: 'bullish' | 'bearish' | 'ranging';
  confidence: number;
  reasons: string[];
  best_move: string;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

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
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setResult(null);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      
      await new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Image = reader.result as string;

            // Call edge function with proper URL
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-chart`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image }),
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Analysis failed');
            }

            const data = await response.json();
            setResult(data);
            
            // Save image to storage and analysis to database
            try {
              const fileExt = selectedImage.name.split('.').pop();
              const fileName = `${Date.now()}.${fileExt}`;
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('chart-images')
                .upload(fileName, selectedImage);

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                .from('chart-images')
                .getPublicUrl(fileName);

              await supabase.from('chart_analyses').insert({
                image_url: publicUrl,
                bias: data.bias,
                confidence: data.confidence,
                reasons: data.reasons,
                best_move: data.best_move,
                user_id: user?.id,
              });
            } catch (saveError) {
              console.error('Error saving analysis:', saveError);
              // Don't show error to user, analysis still succeeded
            }
            
            toast.success('Analysis complete!');
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error('Failed to read image'));
        };
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze chart');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 fade-in">
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/history')}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              View History
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            AI Market Vision
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your trading chart for instant AI-powered analysis
          </p>
        </header>

        {/* Upload Zone */}
        <UploadZone
          onImageSelect={handleImageSelect}
          selectedImage={selectedImage}
          onClear={handleClear}
        />

        {/* Analyze Button */}
        {selectedImage && !result && (
          <div className="text-center mt-8 fade-in">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              size="lg"
              className="glass-card px-8 py-6 text-lg font-semibold hover:shadow-glow text-foreground"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Chart'
              )}
            </Button>
          </div>
        )}

        {/* Results */}
        {result && <ResultsPanel result={result} />}

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-muted-foreground">
          Powered by AI Market Vision
        </footer>
      </div>
    </div>
  );
};

export default Index;
