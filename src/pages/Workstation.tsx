import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music2, BarChart2 } from "lucide-react";
import { CreateReleaseDialog } from "@/components/CreateReleaseDialog";

export default function Workstation() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workstation</h1>
        <CreateReleaseDialog />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card hover:bg-card/90 transition-colors">
          <CardHeader>
            <CardTitle>Recent Releases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">No releases yet. Create your first release!</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover:bg-card/90 transition-colors">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Music2 className="w-4 h-4 mr-2" />
              Browse Catalog
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart2 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover:bg-card/90 transition-colors">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-400">All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
