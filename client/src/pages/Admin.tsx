import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowLeft } from "lucide-react";

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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm px-6 animate-fade-scale">
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 w-16 h-16 rounded-3xl bg-primary/8 border border-primary/10 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary/80" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground mt-1.5">أدخل كلمة المرور للمتابعة</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="input-admin-password"
            dir="ltr"
            className="text-center rounded-2xl bg-card/50 border-border/50 focus:border-primary/30"
          />
          <Button
            type="submit"
            className="w-full rounded-2xl text-sm font-semibold"
            disabled={!password || loginMutation.isPending}
            data-testid="button-admin-login"
          >
            {loginMutation.isPending ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <ArrowLeft className="w-3 h-3" />
            العودة
          </a>
        </div>
      </div>
    </div>
  );
}
