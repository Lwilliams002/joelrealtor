import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  coverImage?: string;
  onCoverImageChange?: (url: string) => void;
  listingId?: string;
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  coverImage, 
  onCoverImageChange,
  listingId 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${listingId || 'temp'}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${listingId || 'uploads'}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error(`Failed to upload ${file.name}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const url = await uploadFile(file);
      if (url) {
        newImages.push(url);
      }
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);
      
      // Set first image as cover if none set
      if (!coverImage && onCoverImageChange) {
        onCoverImageChange(newImages[0]);
      }
      
      toast.success(`Uploaded ${newImages.length} image(s)`);
    }

    setIsUploading(false);
  }, [images, coverImage, onImagesChange, onCoverImageChange, listingId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleRemoveImage = (url: string) => {
    const updatedImages = images.filter(img => img !== url);
    onImagesChange(updatedImages);
    
    if (coverImage === url && onCoverImageChange) {
      onCoverImageChange(updatedImages[0] || '');
    }
  };

  const handleSetCover = (url: string) => {
    if (onCoverImageChange) {
      onCoverImageChange(url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragOver ? "border-accent bg-accent/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop images here, or click to select
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="image-upload"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              Select Images
            </Button>
          </>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div 
              key={url} 
              className={cn(
                "relative group aspect-square rounded-lg overflow-hidden border-2",
                coverImage === url ? "border-accent" : "border-transparent"
              )}
            >
              <img 
                src={url} 
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSetCover(url)}
                  disabled={coverImage === url}
                >
                  {coverImage === url ? 'Cover' : 'Set Cover'}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => handleRemoveImage(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Cover Badge */}
              {coverImage === url && (
                <span className="absolute top-2 left-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">
                  Cover
                </span>
              )}

              {/* Drag Handle */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-white drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
