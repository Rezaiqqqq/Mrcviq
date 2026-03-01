import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Profile, type SocialLink, type Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User, Link2, Newspaper, Settings, LogOut, Plus, Trash2,
  Pin, Upload, ExternalLink, BadgeCheck, Eye, Palette, Lock,
  Camera, ImagePlus, Save, ChevronLeft
} from "lucide-react";
import {
  SiInstagram, SiX, SiTiktok, SiYoutube, SiSnapchat,
  SiLinkedin, SiGithub, SiDiscord, SiTelegram, SiFacebook,
  SiWhatsapp, SiThreads, SiTwitch, SiPinterest
} from "react-icons/si";
import { Globe } from "lucide-react";

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: SiInstagram, x: SiX, twitter: SiX, tiktok: SiTiktok,
  youtube: SiYoutube, snapchat: SiSnapchat, linkedin: SiLinkedin,
  github: SiGithub, discord: SiDiscord, telegram: SiTelegram,
  facebook: SiFacebook, whatsapp: SiWhatsapp, threads: SiThreads,
  twitch: SiTwitch, pinterest: SiPinterest,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", x: "#000000", twitter: "#1DA1F2", tiktok: "#010101",
  youtube: "#FF0000", snapchat: "#FFFC00", linkedin: "#0A66C2", github: "#333333",
  discord: "#5865F2", telegram: "#2CA5E0", facebook: "#1877F2", whatsapp: "#25D366",
  threads: "#000000", twitch: "#9146FF", pinterest: "#E60023",
};

const PLATFORMS = ["instagram", "x", "tiktok", "youtube", "snapchat", "linkedin", "github", "discord", "telegram", "facebook", "whatsapp", "threads", "twitch", "pinterest"];

type Tab = "profile" | "social" | "posts" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "الملف الشخصي", icon: User },
  { id: "social", label: "حسابات التواصل", icon: Link2 },
  { id: "posts", label: "الأخبار", icon: Newspaper },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

function ImageUploader({ currentUrl, onUpload, label }: { currentUrl: string; onUpload: (url: string) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const pwd = sessionStorage.getItem("admin_auth") || "";
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: { "x-admin-password": pwd },
      });
      const data = await res.json();
      if (data.url) onUpload(data.url);
    } catch {
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-muted border border-border/50 flex-shrink-0">
          {currentUrl && <img src={currentUrl} alt="" className="w-full h-full object-cover" />}
          {uploading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <Input
            value={currentUrl}
            onChange={e => onUpload(e.target.value)}
            placeholder="رابط الصورة"
            dir="ltr"
            className="text-xs h-9 rounded-xl bg-muted/50 border-border/30"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-xs rounded-xl w-full"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="w-3.5 h-3.5 ml-1.5" />
            {uploading ? "جاري الرفع..." : "رفع من الجهاز"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 flex items-center gap-2.5">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const adminPwd = sessionStorage.getItem("admin_auth") || "";

  useEffect(() => {
    if (!adminPwd) setLocation("/admin");
  }, [adminPwd, setLocation]);

  const { data: profile } = useQuery<Profile>({ queryKey: ["/api/profile"] });
  const [profileForm, setProfileForm] = useState<Partial<Profile>>({});
  useEffect(() => { if (profile) setProfileForm(profile); }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<Profile>) => apiRequest("PATCH", "/api/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "تم حفظ التغييرات بنجاح" });
    },
  });

  const { data: socialLinks = [] } = useQuery<SocialLink[]>({ queryKey: ["/api/social-links"] });
  const [newLink, setNewLink] = useState({ platform: "instagram", url: "", displayName: "", color: "#E1306C", sortOrder: 0 });

  const addLinkMutation = useMutation({
    mutationFn: (data: typeof newLink) => apiRequest("POST", "/api/social-links", { ...data, icon: data.platform }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      setNewLink({ platform: "instagram", url: "", displayName: "", color: "#E1306C", sortOrder: 0 });
      toast({ title: "تمت الإضافة" });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/social-links/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      toast({ title: "تم الحذف" });
    },
  });

  const { data: posts = [] } = useQuery<Post[]>({ queryKey: ["/api/posts"] });
  const [newPost, setNewPost] = useState({ title: "", content: "", imageUrl: "", isPinned: false });
  const postImageRef = useRef<HTMLInputElement>(null);
  const [postImageUploading, setPostImageUploading] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);

  const addPostMutation = useMutation({
    mutationFn: (data: typeof newPost) => apiRequest("POST", "/api/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPost({ title: "", content: "", imageUrl: "", isPinned: false });
      toast({ title: "تم النشر" });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Post> }) => apiRequest("PATCH", `/api/posts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setEditPost(null);
      toast({ title: "تم التحديث" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/posts"] }),
  });

  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const changePwdMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => apiRequest("POST", "/api/admin/change-password", data),
    onSuccess: () => {
      toast({ title: "تم تغيير كلمة المرور" });
      sessionStorage.setItem("admin_auth", pwdForm.newPassword);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: () => toast({ title: "كلمة المرور الحالية خاطئة", variant: "destructive" }),
  });

  const handlePostImageUpload = async (file: File) => {
    setPostImageUploading(true);
    try {
      const pwd = sessionStorage.getItem("admin_auth") || "";
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: { "x-admin-password": pwd },
      });
      const data = await res.json();
      if (data.url) {
        if (editPost) {
          setEditPost(p => p ? { ...p, imageUrl: data.url } : p);
        } else {
          setNewPost(p => ({ ...p, imageUrl: data.url }));
        }
      }
    } catch {} finally {
      setPostImageUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-l border-border/40 bg-card/30 backdrop-blur-sm shrink-0">
        <div className="p-5 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">لوحة التحكم</h2>
              <p className="text-[11px] text-muted-foreground">إدارة الموقع</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-1 border-t border-border/30">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <Eye className="w-4 h-4" />
            عرض الموقع
          </a>
          <button
            data-testid="button-logout"
            onClick={() => {
              sessionStorage.removeItem("admin_auth");
              setLocation("/admin");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">لوحة التحكم</span>
          </div>
          <div className="flex items-center gap-1">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { sessionStorage.removeItem("admin_auth"); setLocation("/admin"); }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex px-2 pb-2 gap-1 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-10 mt-[7rem] md:mt-0">

            <div
              key={activeTab}
              className="space-y-6 animate-fade-up"
            >
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <>
                  <div className="mb-2">
                    <h1 className="text-lg font-bold text-foreground">الملف الشخصي</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">عدّل معلوماتك الشخصية</p>
                  </div>

                  <SectionCard title="الصور" icon={Camera}>
                    <div className="space-y-5">
                      <ImageUploader
                        currentUrl={profileForm.avatarUrl || ""}
                        onUpload={url => setProfileForm(p => ({ ...p, avatarUrl: url }))}
                        label="الصورة الشخصية"
                      />
                      <ImageUploader
                        currentUrl={profileForm.bannerUrl || ""}
                        onUpload={url => setProfileForm(p => ({ ...p, bannerUrl: url }))}
                        label="صورة البنر"
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="المعلومات الأساسية" icon={User}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">الاسم</Label>
                          <Input
                            value={profileForm.name || ""}
                            onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                            data-testid="input-profile-name"
                            className="rounded-xl bg-muted/30 border-border/30"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">اليوزر</Label>
                          <Input
                            value={profileForm.username || ""}
                            onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))}
                            data-testid="input-profile-username"
                            dir="ltr"
                            className="rounded-xl bg-muted/30 border-border/30"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">النبذة</Label>
                        <Textarea
                          rows={3}
                          value={profileForm.bio || ""}
                          onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                          data-testid="input-profile-bio"
                          className="rounded-xl bg-muted/30 border-border/30 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">الموقع الجغرافي</Label>
                          <Input
                            value={profileForm.location || ""}
                            onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))}
                            data-testid="input-profile-location"
                            className="rounded-xl bg-muted/30 border-border/30"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">الموقع الإلكتروني</Label>
                          <Input
                            value={profileForm.website || ""}
                            onChange={e => setProfileForm(p => ({ ...p, website: e.target.value }))}
                            data-testid="input-profile-website"
                            dir="ltr"
                            className="rounded-xl bg-muted/30 border-border/30"
                          />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="خيارات العرض" icon={Palette}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-background border-2 border-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">دائرة الستوري</p>
                            <p className="text-[11px] text-muted-foreground">إطار متحرك حول الصورة</p>
                          </div>
                        </div>
                        <Switch
                          checked={profileForm.hasStory || false}
                          onCheckedChange={v => setProfileForm(p => ({ ...p, hasStory: v }))}
                          data-testid="switch-has-story"
                        />
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <BadgeCheck className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">شارة التوثيق</p>
                            <p className="text-[11px] text-muted-foreground">علامة التوثيق بجانب الاسم</p>
                          </div>
                        </div>
                        <Switch
                          checked={profileForm.isVerified || false}
                          onCheckedChange={v => setProfileForm(p => ({ ...p, isVerified: v }))}
                          data-testid="switch-is-verified"
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <Button
                    className="w-full rounded-2xl text-sm font-semibold"
                    onClick={() => updateProfileMutation.mutate(profileForm)}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ جميع التغييرات"}
                  </Button>
                </>
              )}

              {/* Social Tab */}
              {activeTab === "social" && (
                <>
                  <div className="mb-2">
                    <h1 className="text-lg font-bold text-foreground">حسابات التواصل</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">أضف روابط حساباتك على منصات التواصل</p>
                  </div>

                  <SectionCard title="إضافة حساب جديد" icon={Plus}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 flex-wrap">
                        {PLATFORMS.map(p => {
                          const Icon = PLATFORM_ICONS[p] || Globe;
                          const isActive = newLink.platform === p;
                          return (
                            <button
                              key={p}
                              onClick={() => setNewLink(prev => ({ ...prev, platform: p, color: PLATFORM_COLORS[p] || "#6366f1" }))}
                              data-testid={`platform-${p}`}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                                isActive
                                  ? "border-primary/30 bg-primary/8 text-primary"
                                  : "border-border/30 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                              }`}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? PLATFORM_COLORS[p] : undefined }} />
                              <span className="truncate">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">اسم العرض</Label>
                          <Input
                            value={newLink.displayName}
                            onChange={e => setNewLink(p => ({ ...p, displayName: e.target.value }))}
                            placeholder="@username"
                            data-testid="input-social-displayname"
                            className="rounded-xl bg-muted/30 border-border/30"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">الرابط</Label>
                          <Input
                            value={newLink.url}
                            onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
                            placeholder="https://..."
                            dir="ltr"
                            data-testid="input-social-url"
                            className="rounded-xl bg-muted/30 border-border/30"
                          />
                        </div>
                      </div>

                      <Button
                        className="w-full rounded-xl"
                        onClick={() => addLinkMutation.mutate(newLink)}
                        disabled={!newLink.url || !newLink.displayName || addLinkMutation.isPending}
                        data-testid="button-add-social"
                      >
                        <Plus className="w-4 h-4 ml-1.5" />
                        إضافة الحساب
                      </Button>
                    </div>
                  </SectionCard>

                  {socialLinks.length > 0 && (
                    <SectionCard title={`الحسابات الحالية (${socialLinks.length})`} icon={Link2}>
                      <div className="space-y-2">
                        {socialLinks.map(link => {
                          const Icon = PLATFORM_ICONS[link.platform.toLowerCase()] || Globe;
                          return (
                            <div
                              key={link.id}
                              data-testid={`social-item-${link.id}`}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20 transition-all"
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: link.color + "15" }}
                              >
                                <Icon className="w-5 h-5" style={{ color: link.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{link.displayName}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{link.platform}</p>
                              </div>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteLinkMutation.mutate(link.id)}
                                data-testid={`button-delete-social-${link.id}`}
                                className="text-destructive/50 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </SectionCard>
                  )}
                </>
              )}

              {/* Posts Tab */}
              {activeTab === "posts" && (
                <>
                  <div className="mb-2">
                    <h1 className="text-lg font-bold text-foreground">الأخبار والمنشورات</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">انشر آخر أخبارك وتحديثاتك</p>
                  </div>

                  {editPost ? (
                    <SectionCard title="تعديل الخبر" icon={Newspaper}>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">العنوان</Label>
                          <Input
                            value={editPost.title}
                            onChange={e => setEditPost(p => p ? { ...p, title: e.target.value } : p)}
                            data-testid="input-edit-post-title"
                            className="rounded-xl bg-muted/30 border-border/30"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">المحتوى</Label>
                          <Textarea
                            rows={4}
                            value={editPost.content}
                            onChange={e => setEditPost(p => p ? { ...p, content: e.target.value } : p)}
                            data-testid="input-edit-post-content"
                            className="rounded-xl bg-muted/30 border-border/30 resize-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">صورة الخبر</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={editPost.imageUrl || ""}
                              onChange={e => setEditPost(p => p ? { ...p, imageUrl: e.target.value } : p)}
                              dir="ltr"
                              placeholder="رابط الصورة"
                              className="rounded-xl bg-muted/30 border-border/30 flex-1"
                            />
                            <input ref={postImageRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handlePostImageUpload(e.target.files[0])} />
                            <Button variant="secondary" size="icon" className="rounded-xl" onClick={() => postImageRef.current?.click()} disabled={postImageUploading}>
                              <ImagePlus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <Pin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">تثبيت الخبر</span>
                          </div>
                          <Switch
                            checked={editPost.isPinned}
                            onCheckedChange={v => setEditPost(p => p ? { ...p, isPinned: v } : p)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setEditPost(null)}>
                            <ChevronLeft className="w-4 h-4 ml-1" /> إلغاء
                          </Button>
                          <Button
                            className="flex-1 rounded-xl"
                            onClick={() => updatePostMutation.mutate({ id: editPost.id, data: editPost })}
                            disabled={updatePostMutation.isPending}
                            data-testid="button-save-edit-post"
                          >
                            <Save className="w-4 h-4 ml-1" /> حفظ
                          </Button>
                        </div>
                      </div>
                    </SectionCard>
                  ) : (
                    <SectionCard title="نشر خبر جديد" icon={Plus}>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">العنوان</Label>
                          <Input
                            value={newPost.title}
                            onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                            placeholder="عنوان الخبر..."
                            data-testid="input-new-post-title"
                            className="rounded-xl bg-muted/30 border-border/30"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">المحتوى</Label>
                          <Textarea
                            rows={4}
                            value={newPost.content}
                            onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                            placeholder="اكتب الخبر هنا..."
                            data-testid="input-new-post-content"
                            className="rounded-xl bg-muted/30 border-border/30 resize-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">صورة الخبر (اختياري)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={newPost.imageUrl}
                              onChange={e => setNewPost(p => ({ ...p, imageUrl: e.target.value }))}
                              placeholder="رابط أو ارفع صورة"
                              dir="ltr"
                              data-testid="input-new-post-image"
                              className="rounded-xl bg-muted/30 border-border/30 flex-1"
                            />
                            <input ref={postImageRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handlePostImageUpload(e.target.files[0])} />
                            <Button variant="secondary" size="icon" className="rounded-xl" onClick={() => postImageRef.current?.click()} disabled={postImageUploading}>
                              <ImagePlus className="w-4 h-4" />
                            </Button>
                          </div>
                          {newPost.imageUrl && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-border/30 aspect-video">
                              <img src={newPost.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <Pin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">تثبيت الخبر</span>
                          </div>
                          <Switch
                            checked={newPost.isPinned}
                            onCheckedChange={v => setNewPost(p => ({ ...p, isPinned: v }))}
                            data-testid="switch-new-post-pinned"
                          />
                        </div>
                        <Button
                          className="w-full rounded-xl"
                          onClick={() => addPostMutation.mutate(newPost)}
                          disabled={!newPost.title || !newPost.content || addPostMutation.isPending}
                          data-testid="button-publish-post"
                        >
                          <Newspaper className="w-4 h-4 ml-1.5" />
                          {addPostMutation.isPending ? "جاري النشر..." : "نشر الخبر"}
                        </Button>
                      </div>
                    </SectionCard>
                  )}

                  {posts.length > 0 && (
                    <SectionCard title={`المنشورات (${posts.length})`} icon={Newspaper}>
                      <div className="space-y-2">
                        {posts.map(post => (
                          <div
                            key={post.id}
                            data-testid={`post-item-${post.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20 transition-all"
                          >
                            {post.imageUrl && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium truncate">{post.title}</p>
                                {post.isPinned && <Pin className="w-3 h-3 text-primary flex-shrink-0" />}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{post.content}</p>
                            </div>
                            <button
                              onClick={() => setEditPost(post)}
                              data-testid={`button-edit-post-${post.id}`}
                              className="text-xs text-primary hover:underline flex-shrink-0"
                            >
                              تعديل
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deletePostMutation.mutate(post.id)}
                              data-testid={`button-delete-post-${post.id}`}
                              className="text-destructive/40 hover:text-destructive flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}
                </>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <>
                  <div className="mb-2">
                    <h1 className="text-lg font-bold text-foreground">الإعدادات</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">إعدادات الأمان والحساب</p>
                  </div>

                  <SectionCard title="تغيير كلمة المرور" icon={Lock}>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">كلمة المرور الحالية</Label>
                        <Input
                          type="password"
                          value={pwdForm.currentPassword}
                          onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))}
                          data-testid="input-current-password"
                          dir="ltr"
                          className="rounded-xl bg-muted/30 border-border/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">كلمة المرور الجديدة</Label>
                        <Input
                          type="password"
                          value={pwdForm.newPassword}
                          onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                          data-testid="input-new-password"
                          dir="ltr"
                          className="rounded-xl bg-muted/30 border-border/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">تأكيد كلمة المرور</Label>
                        <Input
                          type="password"
                          value={pwdForm.confirmPassword}
                          onChange={e => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))}
                          data-testid="input-confirm-password"
                          dir="ltr"
                          className="rounded-xl bg-muted/30 border-border/30"
                        />
                      </div>
                      <Button
                        className="w-full rounded-xl"
                        onClick={() => {
                          if (pwdForm.newPassword !== pwdForm.confirmPassword) {
                            toast({ title: "كلمات المرور غير متطابقة", variant: "destructive" });
                            return;
                          }
                          changePwdMutation.mutate({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
                        }}
                        disabled={!pwdForm.currentPassword || !pwdForm.newPassword || changePwdMutation.isPending}
                        data-testid="button-change-password"
                      >
                        {changePwdMutation.isPending ? "جاري التغيير..." : "تغيير كلمة المرور"}
                      </Button>
                    </div>
                  </SectionCard>

                  <SectionCard title="معلومات" icon={Settings}>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>كلمة المرور الافتراضية</span>
                        <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded-lg" dir="ltr">admin123</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>رابط لوحة التحكم</span>
                        <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded-lg" dir="ltr">/admin</span>
                      </div>
                    </div>
                  </SectionCard>
                </>
              )}
            </div>

        </div>
      </main>
    </div>
  );
}
