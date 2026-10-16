'use dom';

import '@/global.css';
import './demo.css';

import { AnalyzingImage } from '@/components/ui/analyzing-image';

import { DomRoot } from './dom-root';

/** The website's "Analyzing image" loader (21st.dev Loading UI), as the demo uses it. */
export default function AnalyzingImageDom(_: { dom?: import('expo/dom').DOMProps }) {
  return (
    <DomRoot>
      <AnalyzingImage className="size-14 text-primary [--loading-ui-analyzing-image-background:var(--card)]" />
    </DomRoot>
  );
}
