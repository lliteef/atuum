
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface VideoUploadProps {
  initialData?: {
    videoUrl?: string;
  };
  onVideoUpdate?: (url: string) => void;
  onNext?: () => void;
}

export function VideoUpload({ initialData, onVideoUpdate, onNext }: VideoUploadProps) {
  const [videoUrl, setVideoUrl] = useState<string>(
    initialData?.videoUrl || ""
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { id: releaseId } = useParams();

  const handleFileUpload = async (file: File) => {
    const validExtensions = [".mp4", ".mov", ".avi"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file format",
        description: "Please upload an MP4, MOV, or AVI file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('releases')
        .update({ video_url: publicUrl })
        .eq('id', releaseId);

      if (updateError) throw updateError;

      setVideoUrl(publicUrl);
      onVideoUpdate?.(publicUrl);

      toast({
        title: "Upload complete",
        description: "Video has been successfully uploaded.",
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

  const removeVideo = async () => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({ video_url: null })
        .eq('id', releaseId);

      if (error) throw error;

      setVideoUrl("");
      setUploadProgress(0);
      
      toast({
        title: "Video removed",
        description: "Video has been successfully removed.",
      });
    } catch (error) {
      console.error('Error removing video:', error);
      toast({
        title: "Error",
        description: "Failed to remove video",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Video Upload</h2>
      
      {!videoUrl ? (
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
            <p className="text-lg font-medium">Drag and drop your video here</p>
            <p className="text-sm">or</p>
          </div>
          <Button
            variant="outline"
            onClick={() => document.getElementById("video-upload")?.click()}
          >
            Choose File
          </Button>
          <input
            type="file"
            id="video-upload"
            className="hidden"
            accept=".mp4,.mov,.avi"
            onChange={handleFileInput}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Requirements:</p>
            <ul>
              <li>Maximum file size: 500MB</li>
              <li>Formats: MP4, MOV, or AVI</li>
              <li>Resolution: 1920x1080 (Full HD) or higher</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="relative">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeVideo}
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
        disabled={!videoUrl}
      >
        Save and Continue
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
