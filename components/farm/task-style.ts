import {
  DotsThreeCircleIcon,
  DropIcon,
  FirstAidKitIcon,
  FlaskIcon,
  GrainsIcon,
  PlantIcon,
  ShovelIcon,
  SnowflakeIcon,
  TractorIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { TaskKind } from "@/lib/farm";

/** Each kind of task: its icon and colour (the icon tile and the dot under the day), as in the app. The label always names the kind too. */
export const KIND_STYLE: Record<TaskKind, { Icon: typeof PlantIcon; tile: string; dot: string }> = {
  analiz: { Icon: FlaskIcon, tile: "bg-sky-100 text-sky-800", dot: "bg-sky-600" },
  toprak: { Icon: ShovelIcon, tile: "bg-amber-100 text-amber-900", dot: "bg-amber-700" },
  gubre: { Icon: PlantIcon, tile: "bg-secondary text-primary", dot: "bg-primary" },
  ilac: { Icon: FirstAidKitIcon, tile: "bg-violet-100 text-violet-800", dot: "bg-violet-600" },
  ekim: { Icon: GrainsIcon, tile: "bg-gold-soft text-gold", dot: "bg-gold" },
  sulama: { Icon: DropIcon, tile: "bg-blue-100 text-blue-800", dot: "bg-blue-600" },
  hasat: { Icon: TractorIcon, tile: "bg-orange-100 text-orange-900", dot: "bg-orange-600" },
  uyari: { Icon: SnowflakeIcon, tile: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  diger: { Icon: DotsThreeCircleIcon, tile: "bg-muted text-foreground", dot: "bg-muted-foreground" },
};
