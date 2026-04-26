const path = require("path");
const { startServer } = require("next/dist/server/lib/start-server");
const { setGlobal } = require("next/dist/trace/shared");
const { PHASE_DEVELOPMENT_SERVER } = require("next/dist/shared/lib/constants");

const dir = process.cwd();
const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || "127.0.0.1";
const distDir = path.join(dir, ".next");

setGlobal("phase", PHASE_DEVELOPMENT_SERVER);
setGlobal("distDir", distDir);

startServer({
  dir,
  port,
  hostname,
  allowRetry: true,
  isDev: true,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
