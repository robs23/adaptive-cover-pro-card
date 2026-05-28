import { describe, expect, it } from 'vitest';

import { en } from '../src/lib/i18n/en';
import { fr } from '../src/lib/i18n/fr';
import { pl } from '../src/lib/i18n/pl';
import { resolveLocale, t } from '../src/lib/i18n';

describe('resolveLocale', () => {
  it('returns "en" when hass is undefined', () => {
    expect(resolveLocale(undefined)).toBe('en');
  });

  it('prefers hass.locale.language over hass.language', () => {
    expect(resolveLocale({ language: 'en', locale: { language: 'fr' } })).toBe('fr');
  });

  it('falls back to hass.language when locale.language is absent', () => {
    expect(resolveLocale({ language: 'fr' })).toBe('fr');
  });

  it('strips the region tag from BCP-47 codes', () => {
    expect(resolveLocale({ locale: { language: 'fr-CA' } })).toBe('fr');
  });

  it('handles case-insensitive BCP-47 codes', () => {
    expect(resolveLocale({ locale: { language: 'FR-ca' } })).toBe('fr');
  });

  it('returns pl for Polish locale codes', () => {
    expect(resolveLocale({ locale: { language: 'pl' } })).toBe('pl');
  });

  it('strips the region tag from Polish BCP-47 codes', () => {
    expect(resolveLocale({ locale: { language: 'pl-PL' } })).toBe('pl');
  });

  it('falls back to "en" for an unknown locale', () => {
    expect(resolveLocale({ locale: { language: 'de' } })).toBe('en');
  });

  it('falls back to "en" for an empty locale string', () => {
    expect(resolveLocale({ locale: { language: '' } })).toBe('en');
  });
});

describe('t', () => {
  it('returns the key when no locale table has the entry', () => {
    expect(t('does.not.exist', undefined)).toBe('does.not.exist');
  });

  it('returns the EN value when locale resolves to en', () => {
    expect(t('handler.solar', { locale: { language: 'en' } })).toBe('Solar Tracking');
  });

  it('returns the FR table value for fr locale', () => {
    expect(t('handler.solar', { locale: { language: 'fr' } })).toBe('Suivi solaire');
  });

  it('returns the PL table value for pl locale', () => {
    expect(t('handler.solar', { locale: { language: 'pl' } })).toBe('Śledzenie słońca');
  });

  it('returns the key name when neither table has the entry for fr locale', () => {
    expect(t('handler.unknown_handler', { locale: { language: 'fr' } })).toBe(
      'handler.unknown_handler',
    );
  });

  it('interpolates a string parameter', () => {
    expect(t('overrides.ends_in', undefined, { time: '5m' })).toBe('ends in 5m');
  });

  it('interpolates a string parameter in Polish', () => {
    expect(t('overrides.ends_in', { locale: { language: 'pl' } }, { time: '5m' })).toBe(
      'kończy się za 5m',
    );
  });

  it('leaves placeholders intact when no params are passed', () => {
    expect(t('overrides.ends_in', undefined)).toBe('ends in {time}');
  });

  it('leaves placeholders intact when params is an empty object', () => {
    expect(t('overrides.ends_in', undefined, {})).toBe('ends in {time}');
  });

  it('coerces numeric params to strings', () => {
    expect(t('overrides.active_count', undefined, { count: 3 })).toBe('3 active');
  });
});

describe('locale-table parity', () => {
  const flat = (o: unknown, prefix = ''): string[] =>
    typeof o === 'object' && o !== null && !Array.isArray(o)
      ? Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
          flat(v, prefix ? `${prefix}.${k}` : k),
        )
      : [prefix];

  it('FR has exactly the same key paths as EN', () => {
    expect(flat(fr).sort()).toEqual(flat(en).sort());
  });

  it('PL has exactly the same key paths as EN', () => {
    expect(flat(pl).sort()).toEqual(flat(en).sort());
  });
});
