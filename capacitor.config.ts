import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pondflow.app",
  appName: "PondFlow",
  webDir: "public",
  server: {
    url: "https://pondflow.rifkinasss.my.id", // Ganti dengan URL Vercel/produksi Anda
    cleartext: true,
  },
};

export default config;
