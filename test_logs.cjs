const { exec } = require('child_process');
exec('npx pm2 logs test_playit --nostream --lines 100', (err, logStdout, logStderr) => {
    const claimLinkMatch = logStdout.match(/https:\/\/playit\.gg\/claim\/[a-zA-Z0-9]+/);
    console.log("MATCH STDOUT:", claimLinkMatch);
    const claimLinkMatchErr = logStderr.match(/https:\/\/playit\.gg\/claim\/[a-zA-Z0-9]+/);
    console.log("MATCH STDERR:", claimLinkMatchErr);
});
