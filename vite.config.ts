import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    async configureServer(server) {
      try {
        const mod = await import("./server");
        const createServer = mod.createServer ?? mod.default;

        if (typeof createServer !== "function") {
          throw new Error(
            'A função "createServer" não foi encontrada em ./server'
          );
        }

        const app = await createServer();
        server.middlewares.use(app);
      } catch (error) {
        console.error("Erro ao carregar o servidor Express:", error);
      }
    },
  };
}
