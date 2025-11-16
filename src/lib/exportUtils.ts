import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisData {
  id: string;
  image_url: string;
  bias: string;
  confidence: number;
  reasons: string[];
  best_move: string;
  created_at: string;
}

export const exportAsPDF = async (analysis: AnalysisData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.text('Chart Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Date
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date(analysis.created_at).toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Bias
  pdf.setFontSize(16);
  pdf.text(`Bias: ${analysis.bias}`, 20, yPosition);
  yPosition += 10;

  // Confidence
  pdf.setFontSize(14);
  pdf.text(`Confidence: ${analysis.confidence}%`, 20, yPosition);
  yPosition += 10;

  // Best Move
  pdf.text(`Best Move: ${analysis.best_move}`, 20, yPosition);
  yPosition += 15;

  // Reasons
  pdf.setFontSize(12);
  pdf.text('Analysis Reasons:', 20, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  const reasons = Array.isArray(analysis.reasons) ? analysis.reasons : [];
  reasons.forEach((reason: string, index: number) => {
    const lines = pdf.splitTextToSize(`${index + 1}. ${reason}`, pageWidth - 40);
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 6;
    });
  });

  // Add chart image
  if (analysis.image_url) {
    try {
      const img = await fetch(analysis.image_url);
      const blob = await img.blob();
      const reader = new FileReader();
      
      await new Promise((resolve) => {
        reader.onloadend = () => {
          if (yPosition > 200) {
            pdf.addPage();
            yPosition = 20;
          }
          yPosition += 10;
          pdf.text('Chart Image:', 20, yPosition);
          yPosition += 10;
          
          const imgData = reader.result as string;
          const imgWidth = pageWidth - 40;
          const imgHeight = 100;
          pdf.addImage(imgData, 'JPEG', 20, yPosition, imgWidth, imgHeight);
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
    }
  }

  pdf.save(`analysis-${analysis.id.substring(0, 8)}.pdf`);
};

export const exportAsImage = async (analysis: AnalysisData) => {
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '800px';
  tempDiv.style.padding = '40px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  
  const biasIcon = analysis.bias.toLowerCase() === 'bullish' ? '📈' : 
                   analysis.bias.toLowerCase() === 'bearish' ? '📉' : '➖';
  
  tempDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 32px; color: #1a1a1a; margin-bottom: 10px;">Chart Analysis Report</h1>
      <p style="color: #666; font-size: 14px;">${new Date(analysis.created_at).toLocaleDateString()}</p>
    </div>
    
    <img src="${analysis.image_url}" style="width: 100%; border-radius: 12px; margin-bottom: 30px;" />
    
    <div style="background: #f5f5f5; padding: 24px; border-radius: 12px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <span style="font-size: 32px;">${biasIcon}</span>
        <h2 style="font-size: 28px; margin: 0; color: #1a1a1a;">${analysis.bias}</h2>
      </div>
      <p style="font-size: 18px; color: #333; margin: 8px 0;"><strong>Confidence:</strong> ${analysis.confidence}%</p>
      <p style="font-size: 18px; color: #333; margin: 8px 0;"><strong>Best Move:</strong> ${analysis.best_move}</p>
    </div>
    
    <div>
      <h3 style="font-size: 20px; color: #1a1a1a; margin-bottom: 16px;">Analysis Reasons:</h3>
      <ol style="padding-left: 24px;">
        ${(Array.isArray(analysis.reasons) ? analysis.reasons : [])
          .map((reason: string) => `<li style="font-size: 16px; color: #333; margin-bottom: 12px; line-height: 1.6;">${reason}</li>`)
          .join('')}
      </ol>
    </div>
  `;
  
  document.body.appendChild(tempDiv);
  
  const canvas = await html2canvas(tempDiv, {
    backgroundColor: '#ffffff',
    scale: 2,
  });
  
  document.body.removeChild(tempDiv);
  
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analysis-${analysis.id.substring(0, 8)}.png`;
        link.click();
        URL.revokeObjectURL(url);
        resolve();
      } else {
        reject(new Error('Failed to create blob'));
      }
    });
  });
};
