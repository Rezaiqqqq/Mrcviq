import { useQuery } from "@tanstack/react-query";
import { type Profile, type SocialLink, type Post } from "@shared/schema";
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
  instagram: SiInstagram, x: SiX, twitter: SiX, tiktok: SiTiktok,
  youtube: SiYoutube, snapchat: SiSnapchat, linkedin: SiLinkedin,
  github: SiGithub, discord: SiDiscord, telegram: SiTelegram,
  facebook: SiFacebook, whatsapp: SiWhatsapp, threads: SiThreads,
  twitch: SiTwitch, pinterest: SiPinterest,
};

function StoryAvatar({ src, name, hasStory }: { src: string; name: string; hasStory: boolean }) {
  return (
    <div className="relative animate-fade-scale">
      {hasStory && (
        <div className="absolute -inset-[4px] rounded-full story-ring z-0" />
      )}
      <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ${hasStory ? 'ring-[3px] ring-background' : 'ring-2 ring-border'}`}>
        <img src={src} alt={name} className="w-full h-full object-cover" data-testid="profile-avatar" />
      </div>
    </div>
  );
}

function SocialIcon({ link, index }: { link: SocialLink; index: number }) {
  const Icon = PLATFORM_ICONS[link.platform.toLowerCase()] || Globe;
  const iconColor = (link.color === "#000000" || link.color === "#010101") ? "currentColor" : link.color;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`social-link-${link.id}`}
      className="group flex flex-col items-center gap-2 animate-fade-up"
      style={{ animationDelay: `${80 * index}ms` }}
    >
      <div
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95 social-icon-glass"
        style={{
          background: `linear-gradient(135deg, ${link.color}18, ${link.color}08)`,
          boxShadow: `0 0 0 1px ${link.color}15, 0 4px 24px ${link.color}10`,
        }}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 group-hover:scale-110" style={{ color: iconColor }} />
      </div>
      <span className="text-[11px] sm:text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-200">
        {link.displayName}
      </span>
    </a>
  );
}

function NewsCard({ post, index }: { post: Post; index: number }) {
  return (
    <div
      data-testid={`post-card-${post.id}`}
      className="group relative animate-fade-up"
      style={{ animationDelay: `${60 * index}ms` }}
    >
      <div className="relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50 transition-all duration-300 group-hover:border-border group-hover:bg-card/80">
        {post.imageUrl && (
          <div className="aspect-[2/1] w-full overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        )}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-[15px] text-foreground leading-snug">{post.title}</h3>
            {post.isPinned && (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                مثبت
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 pt-1">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(post.createdAt), "d MMMM yyyy", { locale: ar })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: profile, isLoading } = useQuery<Profile>({ queryKey: ["/api/profile"] });
  const { data: socialLinks = [] } = useQuery<SocialLink[]>({ queryKey: ["/api/social-links"] });
  const { data: posts = [] } = useQuery<Post[]>({ queryKey: ["/api/posts"] });

  const pinnedPosts = posts.filter(p => p.isPinned);
  const regularPosts = posts.filter(p => !p.isPinned);
  const sortedPosts = [...pinnedPosts, ...regularPosts];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20" dir="rtl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      {/* Banner */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-none" />
        ) : (
          <>
            <img
              src={profile?.bannerUrl || "/images/banner.png"}
              alt="banner"
              className="w-full h-full object-cover"
              data-testid="profile-banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5 pb-20">
        {/* Avatar */}
        <div className="-mt-16 sm:-mt-20 mb-6 flex flex-col items-center text-center">
          {isLoading ? (
            <Skeleton className="w-32 h-32 rounded-full" />
          ) : (
            <StoryAvatar
              src={profile?.avatarUrl || "/images/avatar-default.png"}
              name={profile?.name || ""}
              hasStory={profile?.hasStory || false}
            />
          )}

          {isLoading ? (
            <div className="mt-5 space-y-2 flex flex-col items-center">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          ) : (
            <div className="mt-5 space-y-1 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-center gap-1.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground" data-testid="profile-name">
                  {profile?.name}
                </h1>
                {profile?.isVerified && (
                  <BadgeCheck className="w-5 h-5 text-primary fill-primary/20" />
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium" data-testid="profile-username">
                {profile?.username}
              </p>
            </div>
          )}

          {!isLoading && profile?.bio && (
            <p
              className="mt-4 text-[13px] sm:text-sm text-muted-foreground leading-relaxed max-w-sm animate-fade-up"
              style={{ animationDelay: "150ms" }}
              data-testid="profile-bio"
            >
              {profile.bio}
            </p>
          )}

          {!isLoading && (profile?.location || profile?.website) && (
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground animate-fade-up" style={{ animationDelay: "200ms" }}>
              {profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </span>
              )}
              {profile?.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary/80 hover:text-primary transition-colors">
                  <Globe className="w-3 h-3" />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Social Icons */}
        {socialLinks.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-center gap-5 sm:gap-6 flex-wrap">
              {socialLinks.map((link, i) => (
                <SocialIcon key={link.id} link={link} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {sortedPosts.length > 0 && socialLinks.length > 0 && (
          <div className="h-px bg-gradient-to-l from-transparent via-border to-transparent mb-8 animate-fade-up" style={{ animationDelay: "300ms" }} />
        )}

        {/* Posts */}
        {sortedPosts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] text-center mb-6 animate-fade-up">
              آخر الأخبار
            </h2>
            {sortedPosts.map((post, i) => (
              <NewsCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}

        {sortedPosts.length === 0 && !isLoading && (
          <div className="text-center py-16 text-muted-foreground/50">
            <p className="text-xs">لا توجد أخبار</p>
          </div>
        )}

        {/* Hidden admin access - invisible, only accessible via direct URL */}
        <div className="h-8" />
      </div>
    </div>
  );
}
