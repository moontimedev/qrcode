export enum QRContentType {
  URL = 'URL',
  TEXT = 'TEXT',
  WIFI = 'WIFI',
  EMAIL = 'EMAIL'
}

export type ECLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRConfig {
  value: string;
  fgColor: string;
  bgColor: string;
  level: ECLevel;
}