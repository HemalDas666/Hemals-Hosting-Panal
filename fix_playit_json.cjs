const fs = require('fs');

let code = fs.readFileSync('src/server/routes/servers.ts', 'utf-8');

code = code.replace(
  'const pm2List = JSON.parse(stdout);',
  `const jsonStart = stdout.indexOf('[');
      const jsonEnd = stdout.lastIndexOf(']');
      const jsonStr = jsonStart !== -1 && jsonEnd !== -1 ? stdout.substring(jsonStart, jsonEnd + 1) : stdout;
      const pm2List = JSON.parse(jsonStr);`
);

fs.writeFileSync('src/server/routes/servers.ts', code);
