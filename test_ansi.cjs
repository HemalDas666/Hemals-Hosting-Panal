const str = '\x1B8\x1B[0mno command provided, doing auto run\x1B[2J\x1B8\x1B[0mVisit link to setup https://playit.gg/claim/6d9b21c5c3';
console.log(str.replace(/\x1b\[[0-9;]*[a-zA-Z]|\x1b./g, ''));
