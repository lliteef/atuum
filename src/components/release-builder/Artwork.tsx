import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ArtworkProps {
  initialData?: {
    artworkUrl?: string;
  };
  onArtworkUpdate?: (url: string) => void;
  onNext?: () => void;
}

export function Artwork({ initialData, onArtworkUpdate, onNext }: ArtworkProps) {
  const [artworkUrl, setArtworkUrl] = useState<string>(
    initialData?.artworkUrl || ""
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { id: releaseId } = useParams();

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const isValidSize = img.width === img.height;
        const isLargeEnough = img.width >= 3000 && img.height >= 3000;
        URL.revokeObjectURL(img.src);
        resolve(isValidSize && isLargeEnough);
      };
    });
  };

  const handleFileUpload = async (file: File) => {
    const validExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file format",
        description: "Please upload a JPG, JPEG, or PNG file.",
        variant: "destructive",
      });
      return;
    }

    const isValid = await validateImage(file);
    if (!isValid) {
      toast({
        title: "Invalid image dimensions",
        description: "Image must be exactly 3000x3000 pixels.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `artwork/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(filePath);

      // Update release record with artwork URL
      const { error: updateError } = await supabase
        .from('releases')
        .update({ artwork_url: publicUrl })
        .eq('id', releaseId);

      if (updateError) throw updateError;

      setArtworkUrl(publicUrl);
      onArtworkUpdate?.(publicUrl);

      toast({
        title: "Upload complete",
        description: "Artwork has been successfully uploaded.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const removeArtwork = async () => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({ artwork_url: null })
        .eq('id', releaseId);

      if (error) throw error;

      setArtworkUrl("");
      setUploadProgress(0);
      
      toast({
        title: "Artwork removed",
        description: "Artwork has been successfully removed.",
      });
    } catch (error) {
      console.error('Error removing artwork:', error);
      toast({
        title: "Error",
        description: "Failed to remove artwork",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Artwork</h2>
      
      {!artworkUrl ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/10" : "border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
          <div className="mb-4 text-muted-foreground">
            <p className="text-lg font-medium">Drag and drop your artwork here</p>
            <p className="text-sm">or</p>
          </div>
          <Button
            variant="outline"
            onClick={() => document.getElementById("artwork-upload")?.click()}
          >
            Choose File
          </Button>
          <input
            type="file"
            id="artwork-upload"
            className="hidden"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileInput}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Requirements:</p>
            <ul>
              <li>Perfect square (3000x3000 pixels)</li>
              <li>Formats: PNG, JPG, or JPEG</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={artworkUrl}
            alt="Release artwork"
            className="w-full aspect-square rounded-lg object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeArtwork}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      <Button 
        className="w-full mt-6"
        onClick={onNext}
        disabled={!artworkUrl}
      >
        Save and Continue
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
