const fs = require('fs');

let code = fs.readFileSync('src/server/routes/servers.ts', 'utf-8');

code = code.replace(/exec\("pm2 /g, 'exec("npx pm2 ');
code = code.replace(/exec\(\`pm2 /g, 'exec(`npx pm2 ');
code = code.replace(/&& pm2 /g, '&& npx pm2 ');

fs.writeFileSync('src/server/routes/servers.ts', code);
