const { exec } = require('child_process');
exec('npx pm2 delete test_playit3; echo hello && npx pm2 save', (err, stdout, stderr) => {
    console.log("ERR:", err);
    console.log("STDOUT:", stdout);
});
