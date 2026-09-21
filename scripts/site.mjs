export const siteUrl = "https://pulsarfab.com";
export const sourceUrl = "https://github.com/pulsarfab/regain";
// Switch to published only after the signed release and shared NINA feed are live.
export const release = { version: "0.4.0.0", published: false, previous: "0.3.1.0" };
export const navigation = [
  { label: "Start", pages: [["index.html", "Meet regain"], ["install.html", "Install & upgrade"]] },
  { label: "Connect", pages: [["nina.html", "NINA"], ["ascom.html", "Windows ASCOM"], ["alpaca.html", "Alpaca server"]] },
  { label: "Equipment", pages: [["cameras.html", "Cameras & recovery"], ["accessories.html", "CAA, EFW & EAF"], ["focuscube3.html", "Pegasus FocusCube3"], ["ofp2.html", "Deep Sky Dad OFP2"]] },
  { label: "Support", pages: [["troubleshooting.html", "Settings & troubleshooting"]] }
];
