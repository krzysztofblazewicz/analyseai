import { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from './ui/button';

interface UploadZoneProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onClear: () => void;
}

export const UploadZone = ({ onImageSelect, selectedImage, onClear }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          onImageSelect(file);
        }
      }
    },
    [onImageSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {selectedImage ? (
        <div className="glass-card rounded-2xl p-6 relative fade-in">
          <Button
            onClick={onClear}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </Button>
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Selected chart"
            className="w-full h-auto rounded-lg"
          />
          <p className="text-sm text-muted-foreground mt-4 text-center">
            {selectedImage.name}
          </p>
        </div>
      ) : (
        <div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`glass-card rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging ? 'border-primary shadow-glow scale-[1.02]' : ''
          }`}
        >
          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              Drop your chart image here
            </h3>
            <p className="text-muted-foreground mb-4">
              or click to upload
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PNG, JPG, WEBP
            </p>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
