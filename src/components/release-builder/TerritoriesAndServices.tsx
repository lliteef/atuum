import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

// Comprehensive list of territories
const territories = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "North Korea", "South Korea",
  "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
  "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
  "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// List of major music streaming services
const streamingServices = [
  "Spotify",
  "Apple Music",
  "Amazon Music",
  "YouTube Music",
  "Pandora",
  "Deezer",
  "Tidal",
  "SoundCloud",
  "iHeartRadio",
  "TikTok",
  "Instagram/Facebook",
  "Beatport",
  "Traxsource",
  "Bandcamp",
  "NetEase Cloud Music",
  "QQ Music",
  "Yandex Music",
  "JioSaavn",
  "Anghami",
  "Boomplay"
];

interface TerritoriesAndServicesProps {
  onNext: () => void;
  onUpdateData: (data: { selectedTerritories: string[], selectedServices: string[] }) => void;
}

export function TerritoriesAndServices({ onNext, onUpdateData }: TerritoriesAndServicesProps) {
  // Initialize state from sessionStorage
  const savedData = JSON.parse(sessionStorage.getItem('territoriesAndServicesData') || '{}');
  
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>(
    savedData.selectedTerritories || territories
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    savedData.selectedServices || streamingServices
  );

  // Save to session storage and update parent whenever selections change
  useEffect(() => {
    const dataToSave = {
      selectedTerritories,
      selectedServices
    };
    sessionStorage.setItem('territoriesAndServicesData', JSON.stringify(dataToSave));
    onUpdateData(dataToSave);
  }, [selectedTerritories, selectedServices, onUpdateData]);

  const toggleTerritory = (territory: string) => {
    setSelectedTerritories(prev =>
      prev.includes(territory)
        ? prev.filter(t => t !== territory)
        : [...prev, territory]
    );
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const selectAllTerritories = () => {
    setSelectedTerritories(territories);
  };

  const deselectAllTerritories = () => {
    setSelectedTerritories([]);
  };

  const selectAllServices = () => {
    setSelectedServices(streamingServices);
  };

  const deselectAllServices = () => {
    setSelectedServices([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Territories and Services</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Territories Section */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Territories</h3>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllTerritories}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAllTerritories}
              >
                Deselect All
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-2">
              {territories.map((territory) => (
                <div key={territory} className="flex items-center space-x-2">
                  <Checkbox
                    id={`territory-${territory}`}
                    checked={selectedTerritories.includes(territory)}
                    onCheckedChange={() => toggleTerritory(territory)}
                  />
                  <label
                    htmlFor={`territory-${territory}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {territory}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Services Section */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Music Streaming Services</h3>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllServices}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAllServices}
              >
                Deselect All
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-2">
              {streamingServices.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={() => toggleService(service)}
                  />
                  <label
                    htmlFor={`service-${service}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}