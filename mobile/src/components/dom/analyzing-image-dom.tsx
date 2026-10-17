'use dom';

import '@/global.css';
import './demo.css';

import { AnalyzingImage } from '@/components/ui/analyzing-image';

import { DomRoot } from './dom-root';

/** The website's "Analyzing image" loader (21st.dev Loading UI), as the demo uses it. */
type Props = {
  dom?: import('expo/dom').DOMProps;
  /** Native side only: the web view, so the screen can restart it (see use-dom-height). */
  ref?: import('react').Ref<import('./use-dom-height').DomViewRef>;
};

export default function AnalyzingImageDom(_: Props) {
  return (
    <DomRoot>
      <AnalyzingImage className="size-14 text-primary [--loading-ui-analyzing-image-background:var(--card)]" />
    </DomRoot>
  );
}
