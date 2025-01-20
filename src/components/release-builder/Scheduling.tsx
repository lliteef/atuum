import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SchedulingProps {
  initialData?: {
    releaseDate?: Date;
    salesStartDate?: Date;
    presaveOption?: string;
    presaveDate?: Date;
    pricing?: string;
  };
  onSchedulingUpdate?: (data: {
    releaseDate?: Date;
    salesStartDate?: Date;
    presaveOption?: string;
    presaveDate?: Date;
    pricing?: string;
  }) => void;
  onNext?: () => void;
}

export function Scheduling({ initialData, onSchedulingUpdate, onNext }: SchedulingProps) {
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(initialData?.releaseDate);
  const [salesDate, setSalesDate] = useState<Date | undefined>(initialData?.salesStartDate);
  const [presaveOption, setPresaveOption] = useState<string>(initialData?.presaveOption || "immediately");
  const [presaveDate, setPresaveDate] = useState<Date | undefined>(initialData?.presaveDate);
  const [pricing, setPricing] = useState<string>(initialData?.pricing || "mid");

  useEffect(() => {
    onSchedulingUpdate?.({
      releaseDate,
      salesStartDate: salesDate,
      presaveOption,
      presaveDate,
      pricing
    });
  }, [releaseDate, salesDate, presaveOption, presaveDate, pricing, onSchedulingUpdate]);

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Scheduling and Pricing</h2>

      <div className="space-y-6">
        {/* Release Date */}
        <div className="space-y-2">
          <Label>Release Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !releaseDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {releaseDate ? format(releaseDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={releaseDate}
                onSelect={setReleaseDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Start Sales Date */}
        <div className="space-y-2">
          <Label>Start Sales Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !salesDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {salesDate ? format(salesDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={salesDate}
                onSelect={setSalesDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Presave Options */}
        <div className="space-y-4">
          <Label>Pre-save Options</Label>
          <RadioGroup
            value={presaveOption}
            onValueChange={setPresaveOption}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="immediately" id="immediately" />
              <Label htmlFor="immediately">Immediately</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="specific-date" id="specific-date" />
              <Label htmlFor="specific-date">On a specific date</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no-presave" id="no-presave" />
              <Label htmlFor="no-presave">No Pre-save</Label>
            </div>
          </RadioGroup>

          {presaveOption === "specific-date" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !presaveDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {presaveDate ? format(presaveDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={presaveDate}
                  onSelect={setPresaveDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <Label>Pricing</Label>
          <Select value={pricing} onValueChange={setPricing}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select pricing tier" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="mid">Mid</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
