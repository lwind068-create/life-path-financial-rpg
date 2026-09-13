import {
  GraduationCap,
  Briefcase,
  Banknote,
  Wrench,
  Gift,
  Rocket,
  Trophy,
  Home,
  TrendingUp,
  PiggyBank,
  ScrollText,
  Tags,
  Users,
  CloudRain,
  Building2,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  banknote: Banknote,
  wrench: Wrench,
  gift: Gift,
  rocket: Rocket,
  trophy: Trophy,
  home: Home,
  "trending-up": TrendingUp,
  "piggy-bank": PiggyBank,
  scroll: ScrollText,
  tags: Tags,
  users: Users,
  "cloud-rain": CloudRain,
  "building-2": Building2,
  "credit-card": CreditCard,
};

interface ChapterIconProps {
  name?: string;
  size?: number;
  className?: string;
}

export function ChapterIcon({ name, size = 26, className }: ChapterIconProps) {
  const Icon = (name && ICON_MAP[name]) || Briefcase;
  return <Icon size={size} className={className} strokeWidth={2} />;
}
