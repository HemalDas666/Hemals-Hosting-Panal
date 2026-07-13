const fs = require('fs');
let code = fs.readFileSync('src/server/routes/servers.ts', 'utf-8');

code = code.replace(
  'const logs = logStdout || "";',
  'const logs = (logStdout || "").replace(/\\x1b\\[[0-9;]*m/g, "");'
);

fs.writeFileSync('src/server/routes/servers.ts', code);
