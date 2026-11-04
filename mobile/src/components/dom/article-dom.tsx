'use dom';

import '@/global.css';
import './demo.css';

import type { MouseEvent } from 'react';

import { DomRoot } from './dom-root';

type Props = {
  /** The article's text as the website renders it (remark-html, sanitized on the server). */
  html: string;
  /** A tapped link, opened by the native side in the phone's browser. */
  onLink: (href: string) => Promise<void>;
  onHeight?: (height: number) => Promise<void>;
  dom?: import('expo/dom').DOMProps;
  ref?: import('react').Ref<import('./use-dom-height').DomViewRef>;
};

const STYLE = `
.article { font-size: 16.5px; line-height: 1.7; color: var(--foreground); overflow-wrap: anywhere; }
.article > * + * { margin-top: 0.9em; }
.article h2 { font-size: 21px; line-height: 1.3; font-weight: 800; margin-top: 1.4em; }
.article h3 { font-size: 18px; line-height: 1.35; font-weight: 700; margin-top: 1.2em; }
.article a { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; font-weight: 600; }
.article ul { list-style: disc; padding-left: 1.4em; }
.article ol { list-style: decimal; padding-left: 1.4em; }
.article li + li { margin-top: 0.35em; }
.article blockquote { border-left: 4px solid var(--primary); padding: 0.2em 0 0.2em 0.9em; color: var(--muted-foreground); font-style: italic; }
.article img { max-width: 100%; height: auto; border-radius: 16px; }
.article strong { font-weight: 700; }
.article hr { border: 0; border-top: 1px solid var(--border); }
.article code { background: var(--muted); border-radius: 6px; padding: 0 4px; font-size: 0.92em; }
`;

/** A news article's text, styled like the website's article page; links open outside the app. */
export default function ArticleDom({ html, onLink, onHeight }: Props) {
  const click = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest('a');
    if (!a) return;
    e.preventDefault();
    const href = a.getAttribute('href');
    if (href) void onLink(href);
  };
  return (
    <DomRoot onHeight={onHeight}>
      <style>{STYLE}</style>
      <div className="article" onClick={click} dangerouslySetInnerHTML={{ __html: html }} />
    </DomRoot>
  );
}
