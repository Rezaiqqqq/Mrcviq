import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Profile, type SocialLink, type Post } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User, Link2, Newspaper, Settings, LogOut, Plus, Trash2,
  Pin, Image, ExternalLink, ChevronRight, BadgeCheck
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

const PLATFORMS = ["instagram", "x", "tiktok", "youtube", "snapchat", "linkedin", "github", "discord", "telegram", "facebook", "whatsapp", "threads", "twitch", "pinterest", "other"];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adminPwd, setAdminPwd] = useState(() => sessionStorage.getItem("admin_auth") || "");

  useEffect(() => {
    if (!adminPwd) setLocation("/admin");
  }, [adminPwd, setLocation]);

  // Profile state
  const { data: profile } = useQuery<Profile>({ queryKey: ["/api/profile"] });
  const [profileForm, setProfileForm] = useState<Partial<Profile>>({});
  useEffect(() => { if (profile) setProfileForm(profile); }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<Profile>) => apiRequest("PATCH", "/api/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "تم الحفظ", description: "تم تحديث الملف الشخصي" });
    },
    onError: () => toast({ title: "خطأ", description: "فشل في الحفظ", variant: "destructive" }),
  });

  // Social Links
  const { data: socialLinks = [] } = useQuery<SocialLink[]>({ queryKey: ["/api/social-links"] });
  const [newLink, setNewLink] = useState({ platform: "instagram", url: "", displayName: "", color: "#E1306C", sortOrder: 0 });

  const addLinkMutation = useMutation({
    mutationFn: (data: typeof newLink) => apiRequest("POST", "/api/social-links", { ...data, icon: data.platform }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      setNewLink({ platform: "instagram", url: "", displayName: "", color: "#E1306C", sortOrder: 0 });
      toast({ title: "تم الإضافة" });
    },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/social-links/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/social-links"] }),
  });

  // Posts
  const { data: posts = [] } = useQuery<Post[]>({ queryKey: ["/api/posts"] });
  const [newPost, setNewPost] = useState({ title: "", content: "", imageUrl: "", isPinned: false });
  const [editPost, setEditPost] = useState<Post | null>(null);

  const addPostMutation = useMutation({
    mutationFn: (data: typeof newPost) => apiRequest("POST", "/api/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPost({ title: "", content: "", imageUrl: "", isPinned: false });
      toast({ title: "تم النشر" });
    },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Post> }) => apiRequest("PATCH", `/api/posts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setEditPost(null);
      toast({ title: "تم التحديث" });
    },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/posts"] }),
  });

  // Password change
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const changePwdMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => apiRequest("POST", "/api/admin/change-password", data),
    onSuccess: () => {
      toast({ title: "تم تغيير كلمة المرور" });
      sessionStorage.setItem("admin_auth", pwdForm.newPassword);
      setAdminPwd(pwdForm.newPassword);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: () => toast({ title: "خطأ", description: "كلمة المرور الحالية خاطئة", variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-foreground">لوحة التحكم</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" data-testid="button-view-site">
                <ExternalLink className="w-4 h-4 ml-1" />
                عرض الموقع
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-logout"
              onClick={() => {
                sessionStorage.removeItem("admin_auth");
                setLocation("/admin");
              }}
            >
              <LogOut className="w-4 h-4 ml-1" />
              خروج
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="profile">
          <TabsList className="w-full grid grid-cols-4 mb-8">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="w-4 h-4 ml-1.5" />
              الملف
            </TabsTrigger>
            <TabsTrigger value="social" data-testid="tab-social">
              <Link2 className="w-4 h-4 ml-1.5" />
              السوشيال
            </TabsTrigger>
            <TabsTrigger value="posts" data-testid="tab-posts">
              <Newspaper className="w-4 h-4 ml-1.5" />
              الأخبار
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="w-4 h-4 ml-1.5" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">معلومات الملف الشخصي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم</Label>
                    <Input
                      id="name"
                      value={profileForm.name || ""}
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      data-testid="input-profile-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">اليوزر</Label>
                    <Input
                      id="username"
                      value={profileForm.username || ""}
                      onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))}
                      data-testid="input-profile-username"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">النبذة التعريفية</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={profileForm.bio || ""}
                    onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="اكتب نبذة عنك..."
                    data-testid="input-profile-bio"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">الموقع</Label>
                    <Input
                      id="location"
                      value={profileForm.location || ""}
                      onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))}
                      placeholder="المدينة، الدولة"
                      data-testid="input-profile-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      value={profileForm.website || ""}
                      onChange={e => setProfileForm(p => ({ ...p, website: e.target.value }))}
                      placeholder="https://example.com"
                      data-testid="input-profile-website"
                      dir="ltr"
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">رابط الصورة الشخصية</Label>
                  <Input
                    id="avatarUrl"
                    value={profileForm.avatarUrl || ""}
                    onChange={e => setProfileForm(p => ({ ...p, avatarUrl: e.target.value }))}
                    placeholder="https://... أو /images/..."
                    data-testid="input-profile-avatar"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bannerUrl">رابط صورة البنر</Label>
                  <Input
                    id="bannerUrl"
                    value={profileForm.bannerUrl || ""}
                    onChange={e => setProfileForm(p => ({ ...p, bannerUrl: e.target.value }))}
                    placeholder="https://... أو /images/banner.png"
                    data-testid="input-profile-banner"
                    dir="ltr"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="hasStory"
                      checked={profileForm.hasStory || false}
                      onCheckedChange={v => setProfileForm(p => ({ ...p, hasStory: v }))}
                      data-testid="switch-has-story"
                    />
                    <Label htmlFor="hasStory">دائرة الستوري</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="isVerified"
                      checked={profileForm.isVerified || false}
                      onCheckedChange={v => setProfileForm(p => ({ ...p, isVerified: v }))}
                      data-testid="switch-is-verified"
                    />
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="isVerified">حساب موثق</Label>
                      <BadgeCheck className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => updateProfileMutation.mutate(profileForm)}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">إضافة حساب جديد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المنصة</Label>
                    <select
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      value={newLink.platform}
                      onChange={e => {
                        const platform = e.target.value;
                        setNewLink(p => ({
                          ...p,
                          platform,
                          color: PLATFORM_COLORS[platform] || "#6366f1"
                        }));
                      }}
                      data-testid="select-social-platform"
                    >
                      {PLATFORMS.map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>اسم العرض</Label>
                    <Input
                      value={newLink.displayName}
                      onChange={e => setNewLink(p => ({ ...p, displayName: e.target.value }))}
                      placeholder="@اسمك"
                      data-testid="input-social-displayname"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الرابط</Label>
                    <Input
                      value={newLink.url}
                      onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
                      placeholder="https://..."
                      data-testid="input-social-url"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>اللون</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newLink.color}
                        onChange={e => setNewLink(p => ({ ...p, color: e.target.value }))}
                        className="w-9 h-9 rounded-md border border-input cursor-pointer"
                        data-testid="input-social-color"
                      />
                      <Input
                        value={newLink.color}
                        onChange={e => setNewLink(p => ({ ...p, color: e.target.value }))}
                        dir="ltr"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => addLinkMutation.mutate(newLink)}
                  disabled={!newLink.url || !newLink.displayName || addLinkMutation.isPending}
                  data-testid="button-add-social"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">الحسابات الحالية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {socialLinks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد حسابات بعد</p>
                )}
                {socialLinks.map(link => {
                  const Icon = PLATFORM_ICONS[link.platform.toLowerCase()] || Globe;
                  return (
                    <div
                      key={link.id}
                      data-testid={`social-item-${link.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: link.color + "22" }}>
                        <Icon className="w-4 h-4" style={{ color: link.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{link.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.platform}</p>
                      </div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLinkMutation.mutate(link.id)}
                        data-testid={`button-delete-social-${link.id}`}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {editPost ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-base">تعديل الخبر</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setEditPost(null)}>إلغاء</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>العنوان</Label>
                    <Input
                      value={editPost.title}
                      onChange={e => setEditPost(p => p ? { ...p, title: e.target.value } : p)}
                      data-testid="input-edit-post-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المحتوى</Label>
                    <Textarea
                      rows={4}
                      value={editPost.content}
                      onChange={e => setEditPost(p => p ? { ...p, content: e.target.value } : p)}
                      data-testid="input-edit-post-content"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رابط الصورة (اختياري)</Label>
                    <Input
                      value={editPost.imageUrl || ""}
                      onChange={e => setEditPost(p => p ? { ...p, imageUrl: e.target.value } : p)}
                      dir="ltr"
                      data-testid="input-edit-post-image"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={editPost.isPinned}
                      onCheckedChange={v => setEditPost(p => p ? { ...p, isPinned: v } : p)}
                      data-testid="switch-edit-post-pinned"
                    />
                    <Label>تثبيت الخبر</Label>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => updatePostMutation.mutate({ id: editPost.id, data: editPost })}
                    disabled={updatePostMutation.isPending}
                    data-testid="button-save-edit-post"
                  >
                    حفظ التعديلات
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">نشر خبر جديد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>العنوان</Label>
                    <Input
                      value={newPost.title}
                      onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                      placeholder="عنوان الخبر"
                      data-testid="input-new-post-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المحتوى</Label>
                    <Textarea
                      rows={4}
                      value={newPost.content}
                      onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                      placeholder="اكتب الخبر هنا..."
                      data-testid="input-new-post-content"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رابط الصورة (اختياري)</Label>
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={newPost.imageUrl}
                        onChange={e => setNewPost(p => ({ ...p, imageUrl: e.target.value }))}
                        placeholder="https://..."
                        dir="ltr"
                        data-testid="input-new-post-image"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={newPost.isPinned}
                      onCheckedChange={v => setNewPost(p => ({ ...p, isPinned: v }))}
                      data-testid="switch-new-post-pinned"
                    />
                    <Label>تثبيت الخبر</Label>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => addPostMutation.mutate(newPost)}
                    disabled={!newPost.title || !newPost.content || addPostMutation.isPending}
                    data-testid="button-publish-post"
                  >
                    <Newspaper className="w-4 h-4 ml-1" />
                    {addPostMutation.isPending ? "جاري النشر..." : "نشر الخبر"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">الأخبار المنشورة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {posts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد أخبار بعد</p>
                )}
                {posts.map(post => (
                  <div
                    key={post.id}
                    data-testid={`post-item-${post.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        {post.isPinned && <Badge variant="secondary" className="text-xs shrink-0"><Pin className="w-3 h-3 ml-1" />مثبت</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditPost(post)}
                        data-testid={`button-edit-post-${post.id}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePostMutation.mutate(post.id)}
                        data-testid={`button-delete-post-${post.id}`}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">تغيير كلمة المرور</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>كلمة المرور الحالية</Label>
                  <Input
                    type="password"
                    value={pwdForm.currentPassword}
                    onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))}
                    data-testid="input-current-password"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور الجديدة</Label>
                  <Input
                    type="password"
                    value={pwdForm.newPassword}
                    onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                    data-testid="input-new-password"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>تأكيد كلمة المرور</Label>
                  <Input
                    type="password"
                    value={pwdForm.confirmPassword}
                    onChange={e => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    data-testid="input-confirm-password"
                    dir="ltr"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
                      toast({ title: "خطأ", description: "كلمات المرور غير متطابقة", variant: "destructive" });
                      return;
                    }
                    changePwdMutation.mutate({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
                  }}
                  disabled={!pwdForm.currentPassword || !pwdForm.newPassword || changePwdMutation.isPending}
                  data-testid="button-change-password"
                >
                  {changePwdMutation.isPending ? "جاري التغيير..." : "تغيير كلمة المرور"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
