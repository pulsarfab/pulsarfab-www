export const siteUrl = "https://pulsarfab.com";
export const sourceUrl = "https://github.com/pulsarfab/regain";
// Switch to published only after the signed release and shared NINA feed are live.
export const release = { version: "0.5.11.0", published: true, previous: "0.5.0.0" };
// Development guides have their own banner; never imply inclusion in a stable ZIP.
export const previews = { "hub.html": { version: "0.6", branch: "codex/regain-hub" } };
export const navigation = [
  { label: "Start", pages: [["index.html", "Meet regain"], ["hardware.html", "Supported hardware"], ["install.html", "Install & upgrade"]] },
  { label: "Connect", pages: [["nina.html", "NINA"], ["ascom.html", "Windows ASCOM"], ["alpaca.html", "Alpaca server"]] },
  { label: "Development preview", pages: [["hub.html", "Regain Hub (0.6 preview)"]] },
  { label: "Equipment", pages: [["cameras.html", "Cameras & recovery"], ["accessories.html", "CAA, EFW & EAF"], ["focuscube3.html", "Pegasus FocusCube3"], ["falcon-v2.html", "Pegasus Falcon V2"], ["ofp2.html", "Deep Sky Dad OFP2"], ["eta.html", "Wanderer ETA M54"]] },
  { label: "Support", pages: [["troubleshooting.html", "Settings & troubleshooting"]] }
];

// Stable direct-camera capabilities, shared by the hardware and camera guides.
// Exposure limits describe accepted settings, not a claim of physical validation
// at every duration/platform. Retained rereads apply to still capture only.
export const directCameras = [
  { name: "ASI2600MM Pro / Duo main sensor", bins: "1–4", seconds: 2000, reread: true },
  { name: "ASI6200MM Pro", bins: "1–4", seconds: 2000, reread: true },
  { name: "ASI676MC", bins: "1", seconds: 2000, reread: true },
  { name: "ASI662MC", bins: "1", seconds: 2000, reread: true, guide: "asi662mc.md" },
  { name: "ASI585MM Pro", bins: "1–4", seconds: 2000, reread: true, guide: "asi585mm-pro.md" },
  { name: "ASI220MM Mini / Duo guide sensor", bins: "1–2", seconds: 10, reread: false }
];
