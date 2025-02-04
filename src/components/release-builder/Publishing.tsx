import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PublishingProps {
  initialData?: {
    publishingType?: string;
    publisherName?: string;
    labelName?: string;
  };
  onPublishingUpdate?: (data: {
    publishingType: string;
    publisherName?: string;
  }) => void;
  onNext?: () => void;
}

export function Publishing({ initialData, onPublishingUpdate, onNext }: PublishingProps) {
  const { id: releaseId } = useParams();
  const { toast } = useToast();
  
  // Get data from session storage or initial data
  const savedData = JSON.parse(sessionStorage.getItem('publishingData') || '{}');
  
  const [publishingType, setPublishingType] = useState<string>(
    savedData.publishingType || initialData?.publishingType || "controlled"
  );
  const [publisherName, setPublisherName] = useState(
    savedData.publisherName || initialData?.publisherName || ""
  );

  useEffect(() => {
    const dataToSave = {
      publishingType,
      publisherName: publishingType === "publisher" ? publisherName : undefined
    };
    
    sessionStorage.setItem('publishingData', JSON.stringify(dataToSave));
    onPublishingUpdate?.(dataToSave);

    // Update the release in the database
    if (releaseId) {
      const updateRelease = async () => {
        const { error } = await supabase
          .from('releases')
          .update({
            publishing_type: publishingType,
            publisher_name: publishingType === "publisher" ? publisherName : null,
          })
          .eq('id', releaseId);

        if (error) {
          console.error('Error updating release:', error);
          toast({
            title: "Error",
            description: "Failed to save changes",
            variant: "destructive",
          });
        }
      };

      updateRelease();
    }
  }, [publishingType, publisherName, releaseId, onPublishingUpdate]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Publishing</h2>

      <div className="space-y-6">
        <RadioGroup
          defaultValue="controlled"
          onValueChange={(value) => setPublishingType(value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="controlled" id="controlled" />
            <Label htmlFor="controlled">All rights controlled by me/label</Label>
          </div>
          {publishingType === "controlled" && (
            <div className="ml-6 mt-2">
              <Label>Imprint/Label Name</Label>
              <Input value={initialData?.labelName} disabled className="bg-muted" />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="publisher" id="publisher" />
            <Label htmlFor="publisher">Published via Music Publisher</Label>
          </div>
          {publishingType === "publisher" && (
            <div className="ml-6 mt-2">
              <Label>Publisher Name</Label>
              <Input
                value={publisherName}
                onChange={(e) => setPublisherName(e.target.value)}
                placeholder="Enter publisher name"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="not-published" id="not-published" />
            <Label htmlFor="not-published">Not Published</Label>
          </div>
        </RadioGroup>

        <Button 
          className="w-full" 
          onClick={onNext}
        >
          Save and Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
