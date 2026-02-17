import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import MoonBackground from './components/MoonBackground';
import { Button, Input, Label, Card } from './components/UIComponents';
import { QRContentType, ECLevel } from './types';
import { Download, Type, Link, Wifi, Mail, Settings2, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [content, setContent] = useState<string>('https://google.com');
  const [contentType, setContentType] = useState<QRContentType>(QRContentType.URL);
  
  // Customization State
  const [fgColor, setFgColor] = useState<string>('#f8fafc'); // Slate-50
  const [bgColor, setBgColor] = useState<string>('#020617'); // Slate-950
  const [ecLevel, setEcLevel] = useState<ECLevel>('M');
  
  // Specific fields
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      // Use standard browser styling for background to ensure transparency works if desired
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `luna-qr-${Date.now()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };

      // Robust base64 encoding that handles unicode characters
      const b64 = btoa(unescape(encodeURIComponent(svgData)));
      img.src = "data:image/svg+xml;base64," + b64;
    }
  };

  useEffect(() => {
    if (contentType === QRContentType.WIFI) {
      setContent(`WIFI:T:WPA;S:${wifiSsid};P:${wifiPass};;`);
    }
  }, [wifiSsid, wifiPass, contentType]);

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-indigo-500/30">
      <MoonBackground />

      {/* Elegant Header */}
      <header className="relative z-10 w-full pt-8 pb-4 px-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-white/5">
            <Moon className="w-5 h-5 text-slate-200" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-[0.2em] text-slate-100">
              LUNA
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Generator</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-6 md:py-12 flex flex-col lg:flex-row gap-12 items-start justify-center">
        
        {/* Left Column: Configuration */}
        <div className="w-full lg:w-5/12 space-y-8">
          
          <section>
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <Settings2 className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Configuration</span>
            </div>

            <Card className="space-y-8">
              {/* Type Selector */}
              <div>
                <Label>Data Type</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[
                    { id: QRContentType.URL, icon: Link, label: 'URL' },
                    { id: QRContentType.TEXT, icon: Type, label: 'Text' },
                    { id: QRContentType.WIFI, icon: Wifi, label: 'WiFi' },
                    { id: QRContentType.EMAIL, icon: Mail, label: 'Email' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id as QRContentType)}
                      className={`group flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-300 ${
                        contentType === type.id 
                          ? 'bg-slate-800 border-indigo-500/50 text-indigo-200' 
                          : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <type.icon className={`w-5 h-5 mb-2 transition-transform duration-300 ${contentType === type.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className="text-[10px] font-medium tracking-wide">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-6">
                {contentType === QRContentType.URL && (
                  <div>
                    <Label>Destination URL</Label>
                    <Input 
                      placeholder="https://example.com"
                      value={content.startsWith('http') || content.startsWith('WIFI') ? content : ''}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                )}

                {contentType === QRContentType.TEXT && (
                  <div>
                    <Label>Plain Text</Label>
                    <textarea 
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none font-light min-h-[140px] resize-none"
                      placeholder="Enter your content..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                )}

                {contentType === QRContentType.WIFI && (
                  <div className="space-y-4">
                    <div>
                      <Label>SSID (Network Name)</Label>
                      <Input 
                        placeholder="Network Name"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input 
                        type="password"
                        placeholder="Network Password"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {contentType === QRContentType.EMAIL && (
                  <div>
                    <Label>Recipient Email</Label>
                    <Input 
                      placeholder="contact@domain.com"
                      value={content.includes('@') ? content : ''}
                      onChange={(e) => setContent(`mailto:${e.target.value}`)}
                    />
                  </div>
                )}
              </div>
            </Card>
          </section>

          <section>
            <Card>
               <div className="grid grid-cols-2 gap-8">
                <div>
                  <Label>Foreground</Label>
                  <div className="flex items-center gap-3 mt-2 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full border border-slate-700 p-0.5 overflow-hidden relative">
                       <input 
                        type="color" 
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-400">{fgColor}</span>
                  </div>
                </div>
                <div>
                  <Label>Background</Label>
                  <div className="flex items-center gap-3 mt-2 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full border border-slate-700 p-0.5 overflow-hidden relative">
                       <input 
                        type="color" 
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-400">{bgColor}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5">
                <Label>Error Correction</Label>
                <div className="flex justify-between gap-2 mt-2">
                  {(['L', 'M', 'Q', 'H'] as ECLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setEcLevel(level)}
                      className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${
                        ecLevel === level 
                        ? 'bg-slate-800 text-indigo-300' 
                        : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </section>
        </div>

        {/* Right Column: Preview */}
        <div className="w-full lg:w-5/12 flex flex-col items-center">
          <div className="sticky top-10 w-full max-w-sm">
            
            <Label className="text-center mb-6 !ml-0">Live Preview</Label>

            <div className="relative group perspective-[1000px]">
              
              <div ref={qrRef} className="relative bg-slate-900/80 backdrop-blur-3xl border border-white/10 p-10 rounded-2xl shadow-2xl flex items-center justify-center aspect-square transition-transform duration-500 hover:rotate-x-2">
                 {/* QR Rendering */}
                 <div className="bg-white p-4 rounded-sm shadow-inner" style={{ backgroundColor: bgColor }}>
                    <QRCodeSVG 
                      value={content || "https://google.com"} 
                      size={240}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={ecLevel}
                      includeMargin={false}
                    />
                 </div>
                 
                 {/* Decorative Frame Markers */}
                 <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-slate-500/50" />
                 <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-slate-500/50" />
                 <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-slate-500/50" />
                 <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-slate-500/50" />
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <Button onClick={handleDownload} fullWidth variant="primary" className="h-12 text-base shadow-indigo-500/20 shadow-lg">
                <Download className="w-4 h-4" />
                <span>Export PNG</span>
              </Button>
              <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest">
                High Resolution Output
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;