'use dom';

import '@/global.css';
import './demo.css';

// Phosphor icons one file each (the package index pulls in every icon).
import { DropIcon } from '@phosphor-icons/react/dist/csr/Drop';
import { FirstAidKitIcon } from '@phosphor-icons/react/dist/csr/FirstAidKit';
import { FlaskIcon } from '@phosphor-icons/react/dist/csr/Flask';
import { GrainsIcon } from '@phosphor-icons/react/dist/csr/Grains';
import { PlantIcon } from '@phosphor-icons/react/dist/csr/Plant';
import { ShovelIcon } from '@phosphor-icons/react/dist/csr/Shovel';
import { SnowflakeIcon } from '@phosphor-icons/react/dist/csr/Snowflake';
import { TractorIcon } from '@phosphor-icons/react/dist/csr/Tractor';

import { SpringCheck } from '@/components/ui/spring-check';
import { TASK_KINDS, type TaskKind } from '@/domain/farm-calendar';

import { DomRoot } from './dom-root';

// The demo calendar's task kinds (components/phone-app/CalendarScreen.tsx), unchanged.
const KIND_STYLE: Record<TaskKind, { Icon: typeof PlantIcon; tile: string; dot: string }> = {
  analiz: { Icon: FlaskIcon, tile: 'bg-sky-100 text-sky-800', dot: 'bg-sky-600' },
  toprak: { Icon: ShovelIcon, tile: 'bg-amber-100 text-amber-900', dot: 'bg-amber-700' },
  gubre: { Icon: PlantIcon, tile: 'bg-secondary text-primary', dot: 'bg-primary' },
  ilac: { Icon: FirstAidKitIcon, tile: 'bg-violet-100 text-violet-800', dot: 'bg-violet-600' },
  ekim: { Icon: GrainsIcon, tile: 'bg-gold-soft text-gold', dot: 'bg-gold' },
  sulama: { Icon: DropIcon, tile: 'bg-blue-100 text-blue-800', dot: 'bg-blue-600' },
  hasat: { Icon: TractorIcon, tile: 'bg-orange-100 text-orange-900', dot: 'bg-orange-600' },
  uyari: { Icon: SnowflakeIcon, tile: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
};

export type DomTask = { id: string; title: string; kind: TaskKind; field: string; time: string; done: boolean };

type Props = {
  label: string;
  tasks: DomTask[];
  onToggle: (id: string, checked: boolean) => Promise<void>;
  onHeight?: (height: number) => Promise<void>;
  dom?: import('expo/dom').DOMProps;
  /** Native side only: the web view, so the screen can restart it (see use-dom-height). */
  ref?: import('react').Ref<import('./use-dom-height').DomViewRef>;
};

/** The demo calendar's task list, exactly as in the website demo: kind tiles and React Bits SpringCheck rows. */
export default function CalendarTasksDom({ label, tasks, onToggle, onHeight }: Props) {
  return (
    <DomRoot onHeight={onHeight}>
      <ul aria-label={label} className="space-y-2">
        {tasks.map((t) => {
          const { Icon, tile } = KIND_STYLE[t.kind];
          return (
            <li key={t.id} className="flex items-start gap-3 rounded-[18px] border border-border bg-card px-3 py-2.5">
              <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[12px] ${tile}`}>
                <Icon aria-hidden="true" weight="duotone" className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <SpringCheck
                  label={t.title}
                  defaultChecked={t.done}
                  onChange={(checked) => void onToggle(t.id, checked)}
                  color="var(--foreground)"
                  fillColor="var(--primary)"
                  checkColor="var(--primary-foreground)"
                  boxSize={20}
                  boxRadius={6}
                  fontSize={14}
                  doneOpacity={0.5}
                  className="w-full items-start [&_.spring-check\_\_press]:mt-[-1px]"
                />
                <span className="-mt-2 block pl-[30px] text-[12px] text-muted-foreground">
                  {TASK_KINDS[t.kind].label} · {t.field} · {t.time}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </DomRoot>
  );
}
