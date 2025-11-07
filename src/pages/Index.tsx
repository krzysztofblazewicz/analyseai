import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/components/UploadZone';
import { ResultsPanel } from '@/components/ResultsPanel';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Demo response until backend is connected
      const mockResult: AnalysisResult = {
        bias: 'bullish',
        confidence: 78,
        reasons: [
          'Liquidity sweep detected above previous high',
          '1H fair value gap filled with strong reaction',
          'Higher-low structure forming at key support level',
          'Bullish order flow indicates buyer strength'
        ],
        best_move: 'Wait for retracement to 1H FVG zone before entering long. Target previous high with stop below structure.'
      };

      setResult(mockResult);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze chart');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 fade-in">
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
