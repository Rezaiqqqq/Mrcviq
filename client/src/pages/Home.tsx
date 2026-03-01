import { useQuery } from "@tanstack/react-query";
import { type Profile, type SocialLink, type Post } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Globe, BadgeCheck, Calendar } from "lucide-react";
import {
  SiInstagram, SiX, SiTiktok, SiYoutube, SiSnapchat,
  SiLinkedin, SiGithub, SiDiscord, SiTelegram, SiFacebook,
  SiWhatsapp, SiThreads, SiTwitch, SiPinterest
} from "react-icons/si";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: SiInstagram,
  x: SiX,
  twitter: SiX,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  snapchat: SiSnapchat,
  linkedin: SiLinkedin,
  github: SiGithub,
  discord: SiDiscord,
  telegram: SiTelegram,
  facebook: SiFacebook,
  whatsapp: SiWhatsapp,
  threads: SiThreads,
  twitch: SiTwitch,
  pinterest: SiPinterest,
};

function StoryRing({ hasStory, children }: { hasStory: boolean; children: React.ReactNode }) {
  if (!hasStory) {
    return (
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-4 border-card bg-muted overflow-hidden shadow-2xl">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="relative">
      <div className="story-ring w-32 h-32 rounded-full p-[3px] shadow-2xl">
        <div className="w-full h-full rounded-full border-2 border-card overflow-hidden bg-muted">
          {children}
        </div>
      </div>
    </div>
  );
}

function SocialCard({ link }: { link: SocialLink }) {
  const Icon = PLATFORM_ICONS[link.platform.toLowerCase()] || Globe;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`social-link-${link.id}`}
      className="hover-elevate flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-card-border transition-all duration-200 group cursor-pointer"
      style={{ borderLeftColor: link.color, borderLeftWidth: "3px" }}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: link.color + "22" }}>
        <Icon className="w-5 h-5" style={{ color: link.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate">{link.platform}</div>
        <div className="text-xs text-muted-foreground truncate">{link.displayName}</div>
      </div>
      <div className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <Globe className="w-4 h-4" />
      </div>
    </a>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Card data-testid={`post-card-${post.id}`} className="overflow-hidden hover-elevate transition-all duration-200">
      {post.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-bold text-base text-foreground leading-tight">{post.title}</h3>
          {post.isPinned && (
            <Badge variant="secondary" className="text-xs shrink-0">مثبت</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
          <Calendar className="w-3 h-3" />
          <span>{format(new Date(post.createdAt), "d MMMM yyyy", { locale: ar })}</span>
        </div>
      </div>
    </Card>
  );
}

export default function Home() {
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: socialLinks = [] } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const pinnedPosts = posts.filter(p => p.isPinned);
  const regularPosts = posts.filter(p => !p.isPinned);
  const sortedPosts = [...pinnedPosts, ...regularPosts];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Banner */}
      <div className="relative w-full h-52 md:h-72 overflow-hidden">
        {profileLoading ? (
          <Skeleton className="w-full h-full rounded-none" />
        ) : (
          <>
            <img
              src={profile?.bannerUrl || "/images/banner.png"}
              alt="banner"
              className="w-full h-full object-cover"
              data-testid="profile-banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-6">
          <div className="flex items-end gap-4">
            {profileLoading ? (
              <Skeleton className="w-32 h-32 rounded-full flex-shrink-0" />
            ) : (
              <StoryRing hasStory={profile?.hasStory || false}>
                <img
                  src={profile?.avatarUrl || "/images/avatar-default.png"}
                  alt={profile?.name}
                  className="w-full h-full object-cover"
                  data-testid="profile-avatar"
                />
              </StoryRing>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-3 mb-8">
          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground" data-testid="profile-name">
                  {profile?.name}
                </h1>
                {profile?.isVerified && (
                  <BadgeCheck className="w-6 h-6 text-primary fill-primary/20" />
                )}
              </div>
              <p className="text-muted-foreground text-sm font-medium" data-testid="profile-username">
                {profile?.username}
              </p>
              {profile?.bio && (
                <p className="text-foreground/80 text-sm leading-relaxed" data-testid="profile-bio">
                  {profile.bio}
                </p>
              )}
              <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                {profile?.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </span>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </>
          )}
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              تواصل معي
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialLinks.map(link => (
                <SocialCard key={link.id} link={link} />
              ))}
            </div>
          </div>
        )}

        {/* Posts / News */}
        {sortedPosts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              آخر الأخبار
            </h2>
            <div className="space-y-4">
              {sortedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {sortedPosts.length === 0 && !profileLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">لا توجد أخبار حتى الآن</p>
          </div>
        )}
      </div>

      {/* Admin Link */}
      <div className="fixed bottom-4 left-4">
        <a
          href="/admin"
          data-testid="link-admin"
          className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          لوحة التحكم
        </a>
      </div>
    </div>
  );
}
