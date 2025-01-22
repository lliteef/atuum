import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ConfirmInvitation = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token, navigate]);

  const handleConfirmInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'invite',
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your account has been confirmed. Please sign in.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
      <Card className="w-full max-w-md p-6 bg-card text-card-foreground">
        <h2 className="text-2xl font-bold text-center mb-6">
          Complete Your Registration
        </h2>
        <form onSubmit={handleConfirmInvitation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Set Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Confirming..." : "Confirm Invitation"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ConfirmInvitation;