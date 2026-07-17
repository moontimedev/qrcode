import React, { useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import MoonBackground from './components/MoonBackground';
import {
  Button,
  Input,
  TextArea,
  Label,
  Card,
  Toggle,
  Segmented,
  QRBoundary,
} from './components/UIComponents';
import type { ContentType, ECLevel, Fields, WifiEncryption } from './types';
import { buildValue, scannability } from './services/qr';
import {
  Download,
  Type,
  Link,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  Contact,
  MapPin,
  Settings2,
  Moon,
  Palette,
  ImagePlus,
  Trash2,
  Copy,
  FileCode,
  Check,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const TYPES: { id: ContentType; icon: React.ElementType; label: string }[] = [
  { id: 'url', icon: Link, label: 'URL' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'wifi', icon: Wifi, label: 'WiFi' },
  { id: 'email', icon: Mail, label: 'Email' },
  { id: 'phone', icon: Phone, label: 'Phone' },
  { id: 'sms', icon: MessageSquare, label: 'SMS' },
  { id: 'vcard', icon: Contact, label: 'Contact' },
  { id: 'geo', icon: MapPin, label: 'Location' },
];

const PRESETS: { name: string; fg: string; bg: string }[] = [
  { name: 'Moonlight', fg: '#E2E8F0', bg: '#020617' },
  { name: 'Classic', fg: '#0F172A', bg: '#FFFFFF' },
  { name: 'Indigo', fg: '#C7D2FE', bg: '#1E1B4B' },
  { name: 'Ocean', fg: '#E0F2FE', bg: '#082F49' },
  { name: 'Forest', fg: '#DCFCE7', bg: '#052E16' },
  { name: 'Sunset', fg: '#FFE4E6', bg: '#4C0519' },
  { name: 'Ink', fg: '#000000', bg: '#FFFFFF' },
];

const EC_OPTIONS: { value: ECLevel; label: string }[] = [
  { value: 'L', label: 'L' },
  { value: 'M', label: 'M' },
  { value: 'Q', label: 'Q' },
  { value: 'H', label: 'H' },
];

const SIZE_OPTIONS = [
  { value: '512', label: '512' },
  { value: '1024', label: '1024' },
  { value: '2048', label: '2048' },
];

const INITIAL_FIELDS: Fields = {
  url: 'https://moonlight.dev',
  text: '',
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  email: { to: '', subject: '', body: '' },
  phone: '',
  sms: { number: '', message: '' },
  vcard: { firstName: '', lastName: '', phone: '', email: '', org: '', title: '', url: '' },
  geo: { lat: '', lng: '' },
};

const PREVIEW_SIZE = 240;

const App: React.FC = () => {
  const [type, setType] = useState<ContentType>('url');
  const [fields, setFields] = useState<Fields>(INITIAL_FIELDS);

  // Design
  const [fgColor, setFgColor] = useState('#E2E8F0');
  const [bgColor, setBgColor] = useState('#020617');
  const [logo, setLogo] = useState<string | null>(null);

  // Advanced
  const [ecLevel, setEcLevel] = useState<ECLevel>('M');
  const [margin, setMargin] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Export
  const [exportSize, setExportSize] = useState('1024');
  const [toast, setToast] = useState<string | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const value = useMemo(() => buildValue(type, fields), [type, fields]);
  const hasContent = value.trim().length > 0;
  // A center logo occludes modules, so force the highest error correction.
  const effectiveEC: ECLevel = logo ? 'H' : ecLevel;
  const scan = useMemo(() => scannability(fgColor, bgColor), [fgColor, bgColor]);

  /* -------------------------------- helpers ------------------------------- */

  const notify = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const patch = <K extends keyof Fields>(key: K, val: Fields[K]) =>
    setFields((f) => ({ ...f, [key]: val }));

  const applyPreset = (fg: string, bg: string) => {
    setFgColor(fg);
    setBgColor(bg);
  };

  const onLogoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /** Serialize the live SVG at an arbitrary pixel size for export. */
  const serializeSized = (size: number): string | null => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', String(size));
    clone.setAttribute('height', String(size));
    return new XMLSerializer().serializeToString(clone);
  };

  const rasterize = (size: number): Promise<HTMLCanvasElement | null> =>
    new Promise((resolve) => {
      const data = serializeSized(size);
      if (!data) return resolve(null);
      const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
        }
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });

  const fileName = (ext: string) => `moon-qr-${type}-${Date.now()}.${ext}`;

  const downloadPNG = async () => {
    const canvas = await rasterize(Number(exportSize));
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = fileName('png');
    a.href = canvas.toDataURL('image/png');
    a.click();
    notify('PNG downloaded');
  };

  const downloadSVG = () => {
    const data = serializeSized(Number(exportSize));
    if (!data) return;
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = fileName('svg');
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    notify('SVG downloaded');
  };

  const copyImage = async () => {
    try {
      const canvas = await rasterize(Number(exportSize));
      if (!canvas || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
        notify('Copy not supported — use download');
        return;
      }
      await new Promise<void>((resolve, reject) =>
        canvas.toBlob((blob) => {
          if (!blob) return reject();
          navigator.clipboard
            .write([new ClipboardItem({ 'image/png': blob })])
            .then(resolve, reject);
        }, 'image/png'),
      );
      notify('Copied to clipboard');
    } catch {
      notify('Copy failed — use download');
    }
  };

  /* -------------------------------- fields -------------------------------- */

  const renderFields = () => {
    switch (type) {
      case 'url':
        return (
          <div>
            <Label>Destination URL</Label>
            <Input
              placeholder="https://example.com"
              value={fields.url}
              onChange={(e) => patch('url', e.target.value)}
              autoFocus
            />
          </div>
        );

      case 'text':
        return (
          <div>
            <Label>Plain Text</Label>
            <TextArea
              placeholder="Enter your content…"
              className="min-h-[140px]"
              maxLength={1200}
              value={fields.text}
              onChange={(e) => patch('text', e.target.value)}
            />
            <p className="text-right text-[10px] text-slate-600 mt-1 mr-1">
              {fields.text.length}/1200
            </p>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <Label>Network Name (SSID)</Label>
              <Input
                placeholder="My Network"
                value={fields.wifi.ssid}
                onChange={(e) => patch('wifi', { ...fields.wifi, ssid: e.target.value })}
              />
            </div>
            <div>
              <Label>Encryption</Label>
              <Segmented<WifiEncryption>
                options={[
                  { value: 'WPA', label: 'WPA/WPA2' },
                  { value: 'WEP', label: 'WEP' },
                  { value: 'nopass', label: 'None' },
                ]}
                value={fields.wifi.encryption}
                onChange={(v) => patch('wifi', { ...fields.wifi, encryption: v })}
              />
            </div>
            {fields.wifi.encryption !== 'nopass' && (
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Network Password"
                  value={fields.wifi.password}
                  onChange={(e) => patch('wifi', { ...fields.wifi, password: e.target.value })}
                />
              </div>
            )}
            <label className="flex items-center justify-between cursor-pointer pt-1">
              <span className="text-sm text-slate-400">Hidden network</span>
              <Toggle
                checked={fields.wifi.hidden}
                onChange={(v) => patch('wifi', { ...fields.wifi, hidden: v })}
                label="Hidden network"
              />
            </label>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label>Recipient</Label>
              <Input
                type="email"
                placeholder="contact@domain.com"
                value={fields.email.to}
                onChange={(e) => patch('email', { ...fields.email, to: e.target.value })}
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Optional subject"
                value={fields.email.subject}
                onChange={(e) => patch('email', { ...fields.email, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <TextArea
                placeholder="Optional message…"
                className="min-h-[100px]"
                value={fields.email.body}
                onChange={(e) => patch('email', { ...fields.email, body: e.target.value })}
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              placeholder="+1 555 000 1234"
              value={fields.phone}
              onChange={(e) => patch('phone', e.target.value)}
            />
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+1 555 000 1234"
                value={fields.sms.number}
                onChange={(e) => patch('sms', { ...fields.sms, number: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <TextArea
                placeholder="Pre-filled message…"
                className="min-h-[100px]"
                value={fields.sms.message}
                onChange={(e) => patch('sms', { ...fields.sms, message: e.target.value })}
              />
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input
                  placeholder="Jane"
                  value={fields.vcard.firstName}
                  onChange={(e) => patch('vcard', { ...fields.vcard, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  placeholder="Doe"
                  value={fields.vcard.lastName}
                  onChange={(e) => patch('vcard', { ...fields.vcard, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  placeholder="+1 555…"
                  value={fields.vcard.phone}
                  onChange={(e) => patch('vcard', { ...fields.vcard, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="jane@site.com"
                  value={fields.vcard.email}
                  onChange={(e) => patch('vcard', { ...fields.vcard, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Company</Label>
                <Input
                  placeholder="Optional"
                  value={fields.vcard.org}
                  onChange={(e) => patch('vcard', { ...fields.vcard, org: e.target.value })}
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="Optional"
                  value={fields.vcard.title}
                  onChange={(e) => patch('vcard', { ...fields.vcard, title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Website</Label>
              <Input
                placeholder="https://…"
                value={fields.vcard.url}
                onChange={(e) => patch('vcard', { ...fields.vcard, url: e.target.value })}
              />
            </div>
          </div>
        );

      case 'geo':
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Latitude</Label>
              <Input
                placeholder="37.7749"
                inputMode="decimal"
                value={fields.geo.lat}
                onChange={(e) => patch('geo', { ...fields.geo, lat: e.target.value })}
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                placeholder="-122.4194"
                inputMode="decimal"
                value={fields.geo.lng}
                onChange={(e) => patch('geo', { ...fields.geo, lng: e.target.value })}
              />
            </div>
          </div>
        );
    }
  };

  /* -------------------------------- render -------------------------------- */

  const ScanIcon = scan.level === 'good' ? ShieldCheck : ShieldAlert;
  const scanColor =
    scan.level === 'good'
      ? 'text-emerald-400'
      : scan.level === 'ok'
        ? 'text-amber-400'
        : 'text-rose-400';

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-indigo-500/30">
      <MoonBackground />

      {/* Header */}
      <header className="relative z-10 w-full pt-8 pb-4 px-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-white/5">
            <Moon className="w-5 h-5 text-slate-200" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-[0.2em] text-slate-100">LUNA</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">QR Generator</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>8 formats · Logo · SVG</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-6 md:py-12 flex flex-col lg:flex-row gap-10 lg:gap-16 items-start justify-center">
        {/* Left: configuration */}
        <div className="w-full lg:w-6/12 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <Settings2 className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Content</span>
            </div>

            <Card className="space-y-8">
              {/* Type grid */}
              <div>
                <Label>Data Type</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {TYPES.map((t) => {
                    const active = type === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={`group flex flex-col items-center justify-center py-3 rounded-lg border transition-all duration-300 ${
                          active
                            ? 'bg-slate-800 border-indigo-500/50 text-indigo-200'
                            : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <t.icon
                          className={`w-5 h-5 mb-1.5 transition-transform duration-300 ${
                            active ? 'scale-110' : 'group-hover:scale-110'
                          }`}
                        />
                        <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic fields */}
              <div>{renderFields()}</div>
            </Card>
          </section>

          {/* Design */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <Palette className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Design</span>
            </div>

            <Card className="space-y-8">
              {/* Presets */}
              <div>
                <Label>Themes</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {PRESETS.map((p) => {
                    const active = fgColor === p.fg && bgColor === p.bg;
                    return (
                      <button
                        key={p.name}
                        title={p.name}
                        onClick={() => applyPreset(p.fg, p.bg)}
                        className={`aspect-square rounded-lg border flex items-center justify-center transition-all ${
                          active
                            ? 'border-indigo-500/70 ring-1 ring-indigo-500/40'
                            : 'border-white/10 hover:border-white/25'
                        }`}
                        style={{ backgroundColor: p.bg }}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: p.fg }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom colors */}
              <div className="grid grid-cols-2 gap-8">
                <ColorField label="Foreground" value={fgColor} onChange={setFgColor} />
                <ColorField label="Background" value={bgColor} onChange={setBgColor} />
              </div>

              {/* Logo */}
              <div className="pt-6 border-t border-white/5">
                <Label>Center Logo</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onLogoPick}
                />
                {logo ? (
                  <div className="flex items-center gap-3 mt-2">
                    <img
                      src={logo}
                      alt="logo"
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 bg-white"
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => setLogo(null)}
                      className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:border-indigo-500/40 hover:text-slate-300 transition-colors text-sm"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Upload image
                  </button>
                )}
                {logo && (
                  <p className="text-[10px] text-slate-600 mt-2 ml-1">
                    Error correction locked to H for reliable scanning.
                  </p>
                )}
              </div>

              {/* Advanced (progressive disclosure) */}
              <div className="pt-2">
                <button
                  onClick={() => setShowAdvanced((s) => !s)}
                  className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  />
                  Advanced
                </button>
                {showAdvanced && (
                  <div className="mt-5 space-y-6">
                    <div>
                      <Label>Error Correction</Label>
                      <Segmented<ECLevel>
                        options={EC_OPTIONS}
                        value={effectiveEC}
                        onChange={setEcLevel}
                      />
                      <p className="text-[10px] text-slate-600 mt-2 ml-1">
                        Higher levels survive damage but hold less data.
                      </p>
                    </div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-slate-400">Quiet zone (margin)</span>
                      <Toggle checked={margin} onChange={setMargin} label="Quiet zone" />
                    </label>
                  </div>
                )}
              </div>
            </Card>
          </section>
        </div>

        {/* Right: preview */}
        <div className="w-full lg:w-5/12 flex flex-col items-center">
          <div className="sticky top-10 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <Label className="!mb-0 !ml-0">Live Preview</Label>
              <span className={`flex items-center gap-1.5 text-[11px] font-medium ${scanColor}`}>
                <ScanIcon className="w-3.5 h-3.5" />
                {scan.level === 'good' ? 'Scannable' : scan.level === 'ok' ? 'Check' : 'Low contrast'}
              </span>
            </div>

            <div className="relative group">
              <div
                ref={qrRef}
                className="relative bg-slate-900/80 backdrop-blur-3xl border border-white/10 p-8 rounded-2xl shadow-2xl flex items-center justify-center aspect-square"
              >
                {hasContent ? (
                  <QRBoundary
                    resetKey={`${value}-${effectiveEC}-${logo}`}
                    fallback={
                      <div className="text-center px-6">
                        <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                        <p className="text-sm text-slate-300">Content too long</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Shorten it or lower error correction.
                        </p>
                      </div>
                    }
                  >
                    <div className="rounded-lg overflow-hidden shadow-inner" style={{ backgroundColor: bgColor }}>
                      <QRCodeSVG
                        value={value}
                        size={PREVIEW_SIZE}
                        fgColor={fgColor}
                        bgColor={bgColor}
                        level={effectiveEC}
                        marginSize={margin ? 4 : 0}
                        imageSettings={
                          logo
                            ? {
                                src: logo,
                                height: Math.round(PREVIEW_SIZE * 0.22),
                                width: Math.round(PREVIEW_SIZE * 0.22),
                                excavate: true,
                              }
                            : undefined
                        }
                      />
                    </div>
                  </QRBoundary>
                ) : (
                  <div className="text-center px-6">
                    <div className="w-14 h-14 rounded-xl border border-dashed border-slate-700 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-400">Your QR will appear here</p>
                    <p className="text-xs text-slate-600 mt-1">Fill in the details to generate</p>
                  </div>
                )}

                {/* Decorative frame markers */}
                <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-slate-500/50" />
                <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-slate-500/50" />
                <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-slate-500/50" />
                <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-slate-500/50" />
              </div>
            </div>

            {/* Scannability message */}
            <p className="text-center text-[11px] text-slate-500 mt-4">{scan.message}</p>

            {/* Export size */}
            <div className="mt-6">
              <Label>Export Size</Label>
              <Segmented options={SIZE_OPTIONS} value={exportSize} onChange={setExportSize} />
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={downloadPNG}
                disabled={!hasContent}
                fullWidth
                variant="primary"
                className="h-12 text-base shadow-indigo-500/20 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={downloadSVG} disabled={!hasContent} variant="secondary">
                  <FileCode className="w-4 h-4" />
                  <span>SVG</span>
                </Button>
                <Button onClick={copyImage} disabled={!hasContent} variant="secondary">
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 bg-slate-800 border border-white/10 text-slate-100 text-sm px-4 py-2.5 rounded-lg shadow-2xl">
          <Check className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      </div>
    </div>
  );
};

/** Circular color swatch that opens the native picker, with hex readout. */
const ColorField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <Label>{label}</Label>
    <div className="flex items-center gap-3 mt-2">
      <div className="w-10 h-10 rounded-full border border-slate-700 p-0.5 overflow-hidden relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
        />
      </div>
      <span className="text-xs font-mono text-slate-400 uppercase">{value}</span>
    </div>
  </div>
);

export default App;
