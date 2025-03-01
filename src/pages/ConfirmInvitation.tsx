
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

const ConfirmInvitation = () => {
  useEffect(() => {
    document.title = "Confirm Invitation | IMG";
  }, []);

  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get token from URL
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token, navigate]);

  const handleConfirmInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match."
      });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters."
      });
      return;
    }

    setLoading(true);
    try {
      // Use updateUser to set the password for the invited user
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your account has been set up. Please sign in.",
      });
      
      // Sign out the user after setting up their account
      await supabase.auth.signOut();
      
      // Redirect to auth page
      navigate("/auth");
    } catch (error: any) {
      console.error("Error confirming invitation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to confirm invitation."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 bg-background border border-white/10">
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/bb145916-30b9-494a-b432-d1264ccf0c21.png" 
            alt="Logo" 
            className="h-8"
          />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-6">Complete Your Registration</h2>
        <form onSubmit={handleConfirmInvitation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">Set Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-muted-foreground">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Setting up account..." : "COMPLETE REGISTRATION"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ConfirmInvitation;
