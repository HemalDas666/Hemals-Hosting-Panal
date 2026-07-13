const { exec } = require('child_process');

exec("npx pm2 jlist", (err, stdout) => {
    const jsonStart = stdout.indexOf('[');
    const jsonEnd = stdout.lastIndexOf(']');
    const jsonStr = jsonStart !== -1 && jsonEnd !== -1 ? stdout.substring(jsonStart, jsonEnd + 1) : stdout;
    const pm2List = JSON.parse(jsonStr);
    console.log(pm2List.map(p => p.name));
});
