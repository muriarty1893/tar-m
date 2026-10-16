'use dom';

import '@/global.css';
import './demo.css';

import { SpringCheck } from '@/components/ui/spring-check';

import { DomRoot } from './dom-root';

type Props = {
  suggestions: string[];
  /** Indexes ticked so far. */
  done: number[];
  onToggle: (index: number, checked: boolean) => Promise<void>;
  onHeight?: (height: number) => Promise<void>;
  dom?: import('expo/dom').DOMProps;
};

/** The demo result's "Öneriler" list: React Bits SpringCheck rows, exactly as in the website demo. */
export default function SuggestionsDom({ suggestions, done, onToggle, onHeight }: Props) {
  return (
    <DomRoot onHeight={onHeight}>
      <ul className="mt-1 space-y-1">
        {suggestions.map((t, i) => (
          <li key={t}>
            <SpringCheck
              label={t}
              defaultChecked={done.includes(i)}
              onChange={(checked) => void onToggle(i, checked)}
              color="var(--foreground)"
              fillColor="var(--primary)"
              checkColor="var(--primary-foreground)"
              boxSize={22}
              boxRadius={7}
              fontSize={14}
              doneOpacity={0.5}
              className="w-full items-start py-1 [&_.spring-check\_\_press]:mt-[-2px]"
            />
          </li>
        ))}
      </ul>
    </DomRoot>
  );
}
