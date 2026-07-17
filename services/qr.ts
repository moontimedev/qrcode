import type { ContentType, Fields } from '../types';

/** Escape characters that are special inside a WIFI: payload. */
const escWifi = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');

const clean = (s: string) => s.replace(/\s+/g, '');

/**
 * Build the raw string that gets encoded into the QR code from the typed
 * field state. Returns '' when the active type doesn't have enough info yet,
 * which the UI uses to show an empty state instead of an invalid code.
 */
export function buildValue(type: ContentType, f: Fields): string {
  switch (type) {
    case 'url':
      return f.url.trim();

    case 'text':
      return f.text;

    case 'wifi': {
      const w = f.wifi;
      if (!w.ssid) return '';
      const pass = w.encryption === 'nopass' ? '' : `P:${escWifi(w.password)};`;
      return `WIFI:T:${w.encryption};S:${escWifi(w.ssid)};${pass}${w.hidden ? 'H:true;' : ''};`;
    }

    case 'email': {
      const e = f.email;
      if (!e.to) return '';
      const params: string[] = [];
      if (e.subject) params.push(`subject=${encodeURIComponent(e.subject)}`);
      if (e.body) params.push(`body=${encodeURIComponent(e.body)}`);
      return `mailto:${e.to.trim()}${params.length ? `?${params.join('&')}` : ''}`;
    }

    case 'phone':
      return f.phone ? `tel:${clean(f.phone)}` : '';

    case 'sms': {
      const s = f.sms;
      if (!s.number) return '';
      return `SMSTO:${clean(s.number)}:${s.message}`;
    }

    case 'vcard': {
      const v = f.vcard;
      if (!v.firstName && !v.lastName && !v.phone && !v.email) return '';
      const full = `${v.firstName} ${v.lastName}`.trim();
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${v.lastName};${v.firstName};;;`,
        `FN:${full}`,
      ];
      if (v.org) lines.push(`ORG:${v.org}`);
      if (v.title) lines.push(`TITLE:${v.title}`);
      if (v.phone) lines.push(`TEL;TYPE=CELL:${v.phone}`);
      if (v.email) lines.push(`EMAIL:${v.email}`);
      if (v.url) lines.push(`URL:${v.url}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'geo': {
      const g = f.geo;
      if (!g.lat || !g.lng) return '';
      return `geo:${g.lat.trim()},${g.lng.trim()}`;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Contrast / scannability helpers                                     */
/* ------------------------------------------------------------------ */

const hexToRgb = (hex: string) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16) || 0;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const relLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};

/** WCAG contrast ratio between two hex colors (1–21). */
export const contrastRatio = (a: string, b: string): number => {
  const l1 = relLuminance(a);
  const l2 = relLuminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

/** True when foreground is darker than background (the reliable orientation). */
export const isDarkOnLight = (fg: string, bg: string): boolean =>
  relLuminance(fg) < relLuminance(bg);

export type Scannability = {
  level: 'good' | 'ok' | 'poor';
  ratio: number;
  message: string;
};

export function scannability(fg: string, bg: string): Scannability {
  const ratio = contrastRatio(fg, bg);
  const darkOnLight = isDarkOnLight(fg, bg);
  if (ratio < 3) {
    return { level: 'poor', ratio, message: 'Low contrast — many scanners will fail' };
  }
  if (!darkOnLight) {
    return { level: 'ok', ratio, message: 'Inverted — light on dark may not scan everywhere' };
  }
  if (ratio < 7) {
    return { level: 'ok', ratio, message: 'Scannable — a touch more contrast is safer' };
  }
  return { level: 'good', ratio, message: 'High contrast — scans reliably' };
}
