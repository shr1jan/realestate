import { defineConfig } from "vite";
import base from "../../vite.config";
import { sites } from "../../scripts/vite/sites-vite-plugin";
// Local integration runner: bypass only the development mock-identity injector.
// App authentication/authorization still run with explicit test identity headers.
export default defineConfig(async (context) => {
  const config = typeof base === "function" ? await base(context) : await base;
  if (config.plugins) config.plugins[1] = sites({mockAuth:false});
  config.server = {...config.server,host:"127.0.0.1"};
  return config;
});
