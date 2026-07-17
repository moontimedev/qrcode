export type ContentType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'email'
  | 'phone'
  | 'sms'
  | 'vcard'
  | 'geo';

export type ECLevel = 'L' | 'M' | 'Q' | 'H';

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface Fields {
  url: string;
  text: string;
  wifi: {
    ssid: string;
    password: string;
    encryption: WifiEncryption;
    hidden: boolean;
  };
  email: { to: string; subject: string; body: string };
  phone: string;
  sms: { number: string; message: string };
  vcard: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    org: string;
    title: string;
    url: string;
  };
  geo: { lat: string; lng: string };
}
