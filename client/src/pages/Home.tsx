import { useEffect, useState, useRef, useCallback } from "react";
import { MapPin, Globe, BadgeCheck, Calendar, Sun, Moon, Music, Pause, Play, Users, Volume2, VolumeX, X } from "lucide-react";
import {
  SiInstagram, SiTiktok, SiTelegram, SiFacebook, SiDiscord
} from "react-icons/si";
import { useTheme } from "@/components/ThemeProvider";
import { HiShoppingBag } from "react-icons/hi2";
import { HiSpeakerphone } from "react-icons/hi";

const PROFILE = {
  name: "Mohammed Reza",
  bio: "اللَّهُمَّ عَجِّل لِوَلِيِّكَ الْفَرَج",
  bannerUrl: "/images/banner.jpg",
  bannerDarkUrl: "/images/banner-dark.png",
  avatarUrl: "/images/avatar.jpg",
  avatarDarkUrl: "/images/avatar-dark.webp",
  hasStory: true,
  location: "العراق، كربلاء",
  isVerified: true,
  musicUrl: "",
  musicTitle: "",
};

const SOCIAL_LINKS = [
  { id: 1, platform: "instagram", url: "https://www.instagram.com/tvt_2?igsh=MWNvdTlxdnBvMHdieg==", displayName: "@tvt_2", icon: "instagram", color: "#E1306C" },
  { id: 2, platform: "tiktok", url: "https://tiktok.com/@rezaiq.313", displayName: "rezaiq.313", icon: "tiktok", color: "#010101" },
  { id: 3, platform: "telegram", url: "https://t.me/Rezaiqq", displayName: "Rezaiqq", icon: "telegram", color: "#2CA5E0" },
  { id: 4, platform: "facebook", url: "https://www.facebook.com/share/1DjvaVj8Br/", displayName: "Mohammed", icon: "facebook", color: "#1877F2" },
  { id: 5, platform: "discord", url: "https://discord.com/users/m7mdredayt", displayName: "m7mdredayt", icon: "discord", color: "#5865F2" },
  { id: 6, platform: "store", url: "https://t.me/ReStoiq", displayName: "متجري", icon: "store", color: "#FF6B35" },
  { id: 7, platform: "channel", url: "https://t.me/reza_iiq", displayName: "قناتي", icon: "channel", color: "#8B5CF6" },
];

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  telegram: SiTelegram,
  facebook: SiFacebook,
  discord: SiDiscord,
  store: HiShoppingBag,
  channel: HiSpeakerphone,
};

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />
      <div className="floating-orb orb-4" />
      <div className="floating-orb orb-5" />
    </div>
  );
}

function MusicPlayer({ musicUrl, musicTitle }: { musicUrl: string; musicTitle: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnd = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [musicUrl]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="animate-fade-up" style={{ animationDelay: "250ms" }}>
      <audio ref={audioRef} src={musicUrl} preload="metadata" />
      <div className="flex items-center gap-3 bg-card/60 dark:bg-card/40 backdrop-blur-xl rounded-2xl px-4 py-3 border border-border/30 max-w-xs mx-auto">
        <button
          onClick={toggle}
          data-testid="button-music-toggle"
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-primary" />
          ) : (
            <Play className="w-4 h-4 text-primary mr-[-1px]" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Music className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <p className="text-xs font-medium text-foreground truncate">{musicTitle || "Now Playing"}</p>
          </div>
          <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/60 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button
          onClick={toggleMute}
          data-testid="button-music-mute"
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {isPlaying && !isMuted && (
          <div className="flex items-end gap-[2px] h-4">
            <span className="music-bar bar-1" />
            <span className="music-bar bar-2" />
            <span className="music-bar bar-3" />
            <span className="music-bar bar-4" />
          </div>
        )}
      </div>
    </div>
  );
}

function StoryViewer({ storyImage, storyAudio, onClose }: { storyImage: string; storyAudio: string; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    const onTimeUpdate = () => {
      if (audio && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      onClose();
    };

    if (audio) {
      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("ended", onEnded);
    }

    return () => {
      document.body.style.overflow = "";
      if (audio) {
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("ended", onEnded);
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [onClose]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" dir="ltr" onClick={handleClose}>
      <audio ref={audioRef} src={storyAudio} preload="auto" />

      <div className="relative w-full max-w-md mx-auto h-[85vh] rounded-2xl overflow-hidden animate-story-zoom shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={storyImage}
          alt="Story"
          className="w-full h-full object-cover"
          data-testid="story-image"
        />

        <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 bg-gradient-to-b from-black/60 via-black/20 to-transparent pb-16">
          <div className="h-[3px] bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/40">
                <img src={PROFILE.avatarUrl} alt={PROFILE.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-white text-sm font-semibold drop-shadow-lg">{PROFILE.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                data-testid="button-story-mute"
                className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={handleClose}
                data-testid="button-story-close"
                className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryAvatar({ src, name, hasStory, onStoryClick }: { src: string; name: string; hasStory: boolean; onStoryClick?: () => void }) {
  return (
    <div className="relative animate-fade-scale cursor-pointer" onClick={hasStory ? onStoryClick : undefined}>
      {hasStory && (
        <div className="absolute -inset-[4px] rounded-full story-ring z-0" />
      )}
      <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ${hasStory ? 'ring-[3px] ring-background' : 'ring-2 ring-border'}`}>
        <img src={src} alt={name} className="w-full h-full object-cover" data-testid="profile-avatar" />
      </div>
    </div>
  );
}

function SocialIcon({ link, index }: { link: typeof SOCIAL_LINKS[0]; index: number }) {
  const Icon = PLATFORM_ICONS[link.platform] || Globe;
  const iconColor = (link.color === "#000000" || link.color === "#010101") ? "currentColor" : link.color;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`social-link-${link.id}`}
      className="group flex items-center justify-center animate-fade-up"
      style={{ animationDelay: `${80 * index}ms` }}
    >
      <div
        className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 social-icon-glass"
        style={{
          background: `linear-gradient(135deg, ${link.color}18, ${link.color}08)`,
          boxShadow: `0 0 0 1px ${link.color}15, 0 4px 24px ${link.color}10`,
        }}
      >
        <Icon className="w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 group-hover:scale-110" style={{ color: iconColor }} />
      </div>
    </a>
  );
}

function VisitorCounter({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60 animate-fade-up" style={{ animationDelay: "400ms" }}>
      <Users className="w-3 h-3" />
      <span data-testid="text-visitor-count">{count.toLocaleString("en-US")}</span>
    </div>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const profile = PROFILE;
  const socialLinks = SOCIAL_LINKS;

  const [visitorCount, setVisitorCount] = useState(0);
  const [showStory, setShowStory] = useState(false);
  const closeStory = useCallback(() => setShowStory(false), []);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem("visitor_count") || "0", 10);
    const visited = sessionStorage.getItem("visited");
    if (!visited) {
      const newCount = stored + 1;
      localStorage.setItem("visitor_count", String(newCount));
      sessionStorage.setItem("visited", "1");
      setVisitorCount(newCount);
    } else {
      setVisitorCount(stored);
    }
  }, []);

  useEffect(() => {
    const playWelcomeChime = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.12 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.6);
        });
      } catch {}
    };

    const handler = () => {
      playWelcomeChime();
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
    };
    document.addEventListener("click", handler, { once: true });
    document.addEventListener("touchstart", handler, { once: true });
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 transition-colors duration-500" dir="rtl">
      {showStory && (
        <StoryViewer
          storyImage="/images/story.jpg"
          storyAudio="/images/story-audio.m4a"
          onClose={closeStory}
        />
      )}
      <FloatingOrbs />

      <button
        onClick={toggleTheme}
        data-testid="button-theme-toggle"
        className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border/40 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-foreground/70" />
        )}
      </button>

      <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
        <img
          src={theme === "dark" ? profile.bannerDarkUrl : profile.bannerUrl}
          alt="banner"
          className="w-full h-full object-cover animate-banner-reveal"
          data-testid="profile-banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5 pb-20">
        <div className="-mt-16 sm:-mt-20 mb-6 flex flex-col items-center text-center">
          <StoryAvatar
            src={theme === "dark" ? profile.avatarDarkUrl : profile.avatarUrl}
            name={profile.name}
            hasStory={profile.hasStory}
            onStoryClick={() => setShowStory(true)}
          />

          <div className="mt-5 space-y-1 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-center" style={{ fontFamily: "'Poppins', sans-serif" }} data-testid="profile-name">
                {profile.name}
              </h1>
            </div>
          </div>

          {profile.bio && (
            <p
              className="mt-4 text-base sm:text-lg text-foreground/80 leading-relaxed max-w-sm animate-fade-up font-arabic"
              style={{ animationDelay: "150ms" }}
              data-testid="profile-bio"
            >
              {profile.bio}
            </p>
          )}

          {profile.location && (
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground animate-fade-up" style={{ animationDelay: "200ms" }}>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </span>
            </div>
          )}
        </div>

        {profile.musicUrl && (
          <div className="mb-8">
            <MusicPlayer musicUrl={profile.musicUrl} musicTitle={profile.musicTitle} />
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-center gap-5 sm:gap-6 flex-wrap">
              {socialLinks.map((link, i) => (
                <SocialIcon key={link.id} link={link} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 mb-4">
          <VisitorCounter count={visitorCount} />
        </div>

        <div className="text-center">
          <a
            href="/admin"
            data-testid="link-admin-copyright"
            className="inline-block text-[11px] text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors duration-300 select-none"
          >
            Designed by Mohammed Reza
          </a>
        </div>
      </div>
    </div>
  );
}
