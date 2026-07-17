<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LunaQR — Elegant QR Generator

A fast, moon-themed QR code generator. Pick a data type, style it, and export a
crisp PNG or SVG — no account, no tracking, everything runs in the browser.

## Features

- **8 data types** — URL, Text, WiFi, Email (subject + body), Phone, SMS, Contact (vCard), and Location.
- **Live preview** with a real-time **scannability indicator** (contrast check).
- **Themes & custom colors** — one-tap presets plus foreground/background pickers.
- **Center logo** — drop in an image; error correction auto-locks to H for reliable scanning.
- **High-res export** — PNG (512 / 1024 / 2048 px), vector **SVG**, or **copy to clipboard**.
- **Advanced controls** — error-correction level and quiet-zone margin, tucked away until you need them.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Build for production:
   `npm run build`

## Tech

React 19 · Vite · Tailwind · [`qrcode.react`](https://github.com/zpao/qrcode.react) · [`lucide-react`](https://lucide.dev)
