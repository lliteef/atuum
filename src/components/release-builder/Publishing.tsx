import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight } from "lucide-react";

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
  const [publishingType, setPublishingType] = useState<string>(initialData?.publishingType || "controlled");
  const [publisherName, setPublisherName] = useState(initialData?.publisherName || "");

  useEffect(() => {
    onPublishingUpdate?.({
      publishingType,
      publisherName: publishingType === "publisher" ? publisherName : undefined
    });
  }, [publishingType, publisherName, onPublishingUpdate]);

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
