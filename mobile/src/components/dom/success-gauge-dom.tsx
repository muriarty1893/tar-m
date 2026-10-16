'use dom';

import '@/global.css';
import './demo.css';

import { SuccessGauge } from '@/components/SuccessGauge';

import { DomRoot } from './dom-root';

/** The website's SuccessGauge (shadcn/recharts half donut + Magic UI NumberTicker), as it is. */
export default function SuccessGaugeDom({ value, onHeight }: { value: number; onHeight?: (height: number) => Promise<void>; dom?: import('expo/dom').DOMProps }) {
  return (
    <DomRoot onHeight={onHeight}>
      <SuccessGauge value={value} />
    </DomRoot>
  );
}
