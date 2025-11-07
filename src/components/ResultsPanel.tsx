import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalysisResult {
  bias: 'bullish' | 'bearish' | 'ranging';
  confidence: number;
  reasons: string[];
  best_move: string;
}

interface ResultsPanelProps {
  result: AnalysisResult;
}

export const ResultsPanel = ({ result }: ResultsPanelProps) => {
  const getBiasIcon = () => {
    switch (result.bias) {
      case 'bullish':
        return <TrendingUp className="w-6 h-6 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-6 h-6 text-red-400" />;
      default:
        return <Minus className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getBiasColor = () => {
    switch (result.bias) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 fade-in">
      <div className="glass-card rounded-2xl p-8">
        {/* Bias Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {getBiasIcon()}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Market Bias</p>
              <h3 className={`text-2xl font-bold capitalize ${getBiasColor()}`}>
                {result.bias}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Confidence</p>
            <p className="text-2xl font-bold">{result.confidence}%</p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="mb-8">
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000"
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>

        {/* Key Points */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4">Key Points</h4>
          <ul className="space-y-2">
            {result.reasons.map((reason, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-muted-foreground"
              >
                <span className="text-primary mt-1">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested Move */}
        <div className="glass-card rounded-xl p-6 bg-primary/5">
          <h4 className="text-lg font-semibold mb-3">Suggested Move</h4>
          <p className="text-foreground leading-relaxed">{result.best_move}</p>
        </div>
      </div>
    </div>
  );
};
