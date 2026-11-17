import type { Page } from '@playwright/test';
import { SAMPLE } from './playwright.config.ts';

export const LANGS = ['en', 'es'] as const;
export type Lang = (typeof LANGS)[number];
export const VARIANTS = ['public', 'guest'] as const;
export type Variant = (typeof VARIANTS)[number];

export const homePath = (lang: Lang) => (lang === 'es' ? '/es/' : '/');
export const invitePath = (lang: Lang) =>
  `${lang === 'es' ? '/es' : ''}/hello/${SAMPLE.INVITE_WORDS.replaceAll(' ', '-')}/`;

/** Opens Home as a public visitor, or as a guest by way of the invite link. */
export async function openHome(
  page: Page,
  lang: Lang,
  variant: Variant,
): Promise<void> {
  if (variant === 'guest') {
    await page.goto(invitePath(lang));
    await page.waitForURL((url) => url.pathname === homePath(lang));
  } else {
    await page.goto(homePath(lang));
  }
}
