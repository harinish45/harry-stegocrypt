
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageLoaded: (
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    originalImage: string
  ) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageLoaded, className }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImage = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        // Create canvas to get image data
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('Unable to get canvas context');
          setLoading(false);
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
        
        // Set preview and call onImageLoaded
        setPreviewURL(e.target?.result as string);
        onImageLoaded(imageData, img.width, img.height, e.target?.result as string);
        setLoading(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    
    // Validate file is an image
    if (!file.type.match('image.*')) {
      alert('Please upload an image file');
      return;
    }
    
    loadImage(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          previewURL ? "border-solid" : "border-dashed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {previewURL ? (
          <div className="relative w-full">
            <img 
              src={previewURL} 
              alt="Uploaded" 
              className="mx-auto max-h-64 object-contain" 
            />
          </div>
        ) : (
          <>
            <div className="mb-2 rounded-full bg-secondary p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Drag and drop an image, or click to select
            </p>
            <p className="text-xs text-muted-foreground/70">
              PNG, JPG up to 5MB
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
      </div>
      
      {previewURL && (
        <Button 
          variant="outline" 
          onClick={(e) => {
            e.stopPropagation();
            setPreviewURL(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="mt-2 w-full"
        >
          Clear Image
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
