'use dom';

import '@/global.css';
import './demo.css';

import { SuccessGauge } from '@/components/SuccessGauge';

import { DomRoot } from './dom-root';

/** The website's SuccessGauge (shadcn/recharts half donut + Magic UI NumberTicker), as it is. */
type Props = {
  value: number;
  onHeight?: (height: number) => Promise<void>;
  dom?: import('expo/dom').DOMProps;
  /** Native side only: the web view, so the screen can restart it (see use-dom-height). */
  ref?: import('react').Ref<import('./use-dom-height').DomViewRef>;
};

export default function SuccessGaugeDom({ value, onHeight }: Props) {
  return (
    <DomRoot onHeight={onHeight}>
      <SuccessGauge value={value} />
    </DomRoot>
  );
}
