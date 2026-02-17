export enum QRContentType {
  TEXT = 'TEXT',
  URL = 'URL',
  WIFI = 'WIFI',
  EMAIL = 'EMAIL'
}

export interface QRConfig {
  value: string;
  fgColor: string;
  bgColor: string;
  size: number;
}

export interface GeminiResponse {
  text: string;
}