import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Disc, Music, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type ReleaseType = "Digital" | "Music Video";
type ReleaseFormat = "Album/Full Length" | "EP" | "Single";

export function CreateReleaseDialog() {
  const navigate = useNavigate();
  const [releaseType, setReleaseType] = useState<ReleaseType | null>(null);
  const [format, setFormat] = useState<ReleaseFormat | null>(null);
  const [releaseName, setReleaseName] = useState("");
  const [releaseNo, setReleaseNo] = useState("");
  const [releaseVersion, setReleaseVersion] = useState("");
  const [hasUPC, setHasUPC] = useState<boolean>(false);
  const [upcNumber, setUpcNumber] = useState("");

  const handleCreateRelease = () => {
    if (!releaseType || !format || !releaseName || !releaseNo) {
      return; // Don't proceed if required fields are missing
    }

    navigate("/release-builder", {
      state: {
        releaseName,
        upc: hasUPC ? upcNumber : undefined,
        releaseType,
        format,
        releaseNo,
        releaseVersion,
      },
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Release
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Release</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Release Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Release Type *</label>
            <div className="flex gap-4">
              {[
                { type: "Digital" as ReleaseType, icon: Music },
                { type: "Physical" as ReleaseType, icon: Disc },
                { type: "Music Video" as ReleaseType, icon: Video }
              ].map(({ type, icon: Icon }) => (
                <Button
                  key={type}
                  variant={releaseType === type ? "default" : "outline"}
                  className={cn(
                    "flex-1 gap-2",
                    releaseType === type ? "bg-primary text-primary-foreground" : ""
                  )}
                  onClick={() => setReleaseType(type)}
                >
                  <Icon className="w-4 h-4" />
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Format *</label>
            <div className="flex gap-4">
              {["Album/Full Length", "EP", "Single"].map((formatOption) => (
                <Button
                  key={formatOption}
                  variant={format === formatOption ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    format === formatOption ? "bg-primary text-primary-foreground" : ""
                  )}
                  onClick={() => setFormat(formatOption as ReleaseFormat)}
                >
                  {formatOption}
                </Button>
              ))}
            </div>
          </div>

          {/* Release Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Release Name *</label>
            <Input
              placeholder="Enter release name"
              value={releaseName}
              onChange={(e) => setReleaseName(e.target.value)}
            />
          </div>

          {/* Release No. */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Release No. *</label>
            <Input
              placeholder="AAM003"
              value={releaseNo}
              onChange={(e) => setReleaseNo(e.target.value)}
            />
          </div>

          {/* Release Version */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Release Version</label>
            <Input
              placeholder="Enter release version (optional)"
              value={releaseVersion}
              onChange={(e) => setReleaseVersion(e.target.value)}
            />
          </div>

          {/* UPC */}
          <div className="space-y-2">
            <label className="text-sm font-medium">UPC *</label>
            <div className="flex gap-4">
              <Button
                variant={!hasUPC ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setHasUPC(false);
                  setUpcNumber("");
                }}
              >
                Assign one for me
              </Button>
              <Button
                variant={hasUPC ? "default" : "outline"}
                className="flex-1"
                onClick={() => setHasUPC(true)}
              >
                I already have one
              </Button>
            </div>
            {hasUPC && (
              <Input
                placeholder="Enter UPC number"
                value={upcNumber}
                onChange={(e) => setUpcNumber(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Create Release Button */}
          <Button
            className="w-full"
            onClick={handleCreateRelease}
            disabled={!releaseType || !format || !releaseName || !releaseNo}
          >
            Create Release
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
