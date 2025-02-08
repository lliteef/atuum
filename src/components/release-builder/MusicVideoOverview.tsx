
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MusicVideoReleaseData } from "@/pages/MusicVideoReleaseBuilder";

interface MusicVideoOverviewProps {
  releaseData: MusicVideoReleaseData;
  errors: string[];
  onNext: () => void;
}

export function MusicVideoOverview({ releaseData, errors, onNext }: MusicVideoOverviewProps) {
  return (
    <div className="container max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Release Name</h3>
            <p>{releaseData.release_name}</p>
          </div>
          <div>
            <h3 className="font-semibold">UPC</h3>
            <p>{releaseData.upc || "Will be assigned"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Primary Artists</h3>
            <p>{releaseData.primary_artists?.join(", ") || "None"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Featured Artists</h3>
            <p>{releaseData.featured_artists?.join(", ") || "None"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Genre</h3>
            <p>{releaseData.genre || "Not specified"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Subgenre</h3>
            <p>{releaseData.subgenre || "Not specified"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Label</h3>
            <p>{releaseData.label || "Not specified"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Release Date</h3>
            <p>{releaseData.release_date || "Not specified"}</p>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-destructive/10 p-4 rounded-md">
            <h3 className="font-semibold text-destructive mb-2">Errors</h3>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-destructive">{error}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={onNext}
          disabled={errors.length > 0}
          className="w-full"
        >
          Submit Release
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
