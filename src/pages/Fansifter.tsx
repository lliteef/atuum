import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Share2, Target, Megaphone } from "lucide-react";

export default function Fansifter() {
  useEffect(() => {
    document.title = "Marketing | IMG";
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Marketing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card hover:bg-card/90 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Link2 className="w-5 h-5" />
              <span>Smart Links</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Create custom landing pages for your music</p>
            <Button variant="outline" className="w-full">
              Create Link
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover:bg-card/90 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>Social Media</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Schedule and manage your social posts</p>
            <Button variant="outline" className="w-full">
              Create Post
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover:bg-card/90 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Ad Campaigns</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Create and manage promotional campaigns</p>
            <Button variant="outline" className="w-full">
              Start Campaign
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover:bg-card/90 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Megaphone className="w-5 h-5" />
              <span>Promotion Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Access marketing resources and tools</p>
            <Button variant="outline" className="w-full">
              Explore Tools
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}