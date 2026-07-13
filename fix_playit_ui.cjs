const fs = require('fs');

let code = fs.readFileSync('src/pages/PlayitTunnel.tsx', 'utf-8');

code = code.replace(
  'if (res.data.logs) {',
  'if (res.data.logs !== undefined) {'
);

fs.writeFileSync('src/pages/PlayitTunnel.tsx', code);
