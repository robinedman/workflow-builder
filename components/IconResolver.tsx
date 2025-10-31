import {
  Sparkles,
  Languages,
  FileText,
  MousePointerClick,
  Box,
  MonitorPlay,
  MessageSquare,
} from "lucide-react";

const iconMap = {
  Sparkles,
  Languages,
  FileText,
  MousePointerClick,
  Box,
  MonitorPlay,
  MessageSquare,
};

export const resolveIcon = (iconName: string, size = 14) => {
  const Icon = iconMap[iconName as keyof typeof iconMap];
  return Icon ? <Icon size={size} /> : null;
};
