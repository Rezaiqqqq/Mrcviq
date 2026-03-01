import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowRight } from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/login", { password }),
    onSuccess: () => {
      sessionStorage.setItem("admin_auth", password);
      setLocation("/admin/dashboard");
    },
    onError: () => {
      toast({ title: "خطأ", description: "كلمة مرور خاطئة", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm px-4">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-xl">لوحة التحكم</CardTitle>
            <CardDescription>أدخل كلمة المرور للدخول</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loginMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-admin-password"
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!password || loginMutation.isPending}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? "جاري الدخول..." : "دخول"}
                <ArrowRight className="w-4 h-4 mr-1" />
              </Button>
            </form>
            <div className="mt-4 text-center">
              <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                العودة للموقع
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
