const Docker = require("dockerode");
const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

async function run() {
  try {
    const stream = await docker.pull("playitcloud/playit-agent:latest");
    console.log("Pulled image");
  } catch (e) {
    console.error(e);
  }
}
run();
