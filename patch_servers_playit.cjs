const fs = require('fs');

let code = fs.readFileSync('src/server/routes/servers.ts', 'utf-8');

code = code.replace(
  'exec(`pm2 start "${playitCommand}" --name ${pm2Name} && pm2 save`, (err, stdout, stderr) => {',
  'const secretPath = require("path").join(process.cwd(), ".data", "servers", id, "playit.toml");\n  exec(`pm2 start "${playitCommand}" --name ${pm2Name} -- --secret_path ${secretPath} && pm2 save`, (err, stdout, stderr) => {'
);

fs.writeFileSync('src/server/routes/servers.ts', code);
