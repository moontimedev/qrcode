import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import MoonBackground from './components/MoonBackground';
import { Button, Input, Label, Card } from './components/UIComponents';
import { generateCreativeContent } from './services/geminiService';
import { QRContentType } from './types';
import { Download, Sparkles, Moon, Wand2, Type, Link, Wifi, Mail, Palette } from 'lucide-react';

const App: React.FC = () => {
  const [content, setContent] = useState<string>('https://gemini.google.com');
  const [contentType, setContentType] = useState<QRContentType>(QRContentType.URL);
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [fgColor, setFgColor] = useState<string>('#e2e8f0'); // Slate-200
  const [bgColor, setBgColor] = useState<string>('#020617'); // Slate-950
  
  // Specific fields
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  
  const qrRef = useRef<HTMLDivElement>(null);

  const handleGeminiGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const text = await generateCreativeContent(prompt);
    setContent(text);
    setContentType(QRContentType.TEXT);
    setIsGenerating(false);
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "moon-qr.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  useEffect(() => {
    if (contentType === QRContentType.WIFI) {
      setContent(`WIFI:T:WPA;S:${wifiSsid};P:${wifiPass};;`);
    }
  }, [wifiSsid, wifiPass, contentType]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative">
      <MoonBackground />

      {/* Header */}
      <header className="relative z-10 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
            <Moon className="w-6 h-6 text-indigo-300 fill-indigo-300/20" />
          </div>
          <h1 className="text-2xl font-light tracking-wide">
            Luna<span className="font-semibold text-indigo-300">QR</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Left Column: Controls */}
        <div className="w-full lg:w-1/2 space-y-6">
          <Card className="space-y-6">
            <div>
              <Label>Content Type</Label>
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
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      contentType === type.id 
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                        : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <type.icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Fields based on Type */}
            <div className="space-y-4">
              {contentType === QRContentType.URL && (
                <div>
                  <Label>Website URL</Label>
                  <Input 
                    placeholder="https://example.com"
                    value={content.startsWith('http') || content.startsWith('WIFI') ? content : ''}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              )}

              {contentType === QRContentType.TEXT && (
                <div>
                  <Label>Text Content</Label>
                  <textarea 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors outline-none min-h-[120px] resize-none"
                    placeholder="Enter your message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              )}

              {contentType === QRContentType.WIFI && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Network Name (SSID)</Label>
                    <Input 
                      placeholder="MyWifi"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input 
                      type="password"
                      placeholder="********"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {contentType === QRContentType.EMAIL && (
                <div>
                  <Label>Email Address</Label>
                  <Input 
                    placeholder="hello@moon.com"
                    value={content.includes('@') ? content : ''}
                    onChange={(e) => setContent(`mailto:${e.target.value}`)}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* AI Generation Card */}
          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="text-lg font-medium text-amber-50">Ask the Moon</h3>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Not sure what to say? Let the stars guide your message. Generate a poem, a greeting, or a cryptic note.
              </p>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g., A love poem for Luna" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="!bg-slate-800/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleGeminiGenerate()}
                />
                <Button 
                  onClick={handleGeminiGenerate} 
                  isLoading={isGenerating}
                  disabled={!prompt}
                  variant="primary"
                >
                  <Wand2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Styling Options */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-200">Eclipse Styles</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="color" 
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                  />
                  <span className="text-xs text-slate-400 font-mono">{fgColor}</span>
                </div>
              </div>
              <div>
                <Label>Background</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                  />
                  <span className="text-xs text-slate-400 font-mono">{bgColor}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Preview */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="sticky top-10 w-full max-w-md">
            <div className="relative group">
              {/* Glow Effect behind QR */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              
              <div ref={qrRef} className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl flex items-center justify-center aspect-square">
                 {/* QR Rendering */}
                 <div className="bg-white rounded-lg p-2" style={{ backgroundColor: bgColor }}>
                    <QRCodeSVG 
                      value={content || "https://gemini.google.com"} 
                      size={256}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level="H"
                      includeMargin={false}
                    />
                 </div>
                 
                 {/* Corner Accents */}
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-400/50 rounded-tl-xl m-4" />
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-400/50 rounded-tr-xl m-4" />
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-400/50 rounded-bl-xl m-4" />
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-400/50 rounded-br-xl m-4" />
              </div>
            </div>

            <div className="mt-8 flex justify-center w-full">
              <Button onClick={handleDownload} className="w-full text-lg group">
                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                <span>Save to Gallery</span>
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-500">
              <p>Generated codes work best with high contrast colors.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;