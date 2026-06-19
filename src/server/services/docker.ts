import Docker from "dockerode";
import fs from "fs-extra";
import path from "path";
import { io } from "../../../server.js"; // Import socket for logs

const isSandbox = !fs.existsSync("/var/run/docker.sock") && process.platform !== "win32";

export const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

// Mock state for sandbox demo
const mockState: Record<string, boolean> = {};

export const getPaperVersions = async () => {
  // Using an open API to get PaperMC versions
  try {
    const res = await fetch("https://api.papermc.io/v2/projects/paper");
    const data = (await res.json()) as any;
    return data.versions.reverse();
  } catch (err) {
    return ["1.21.1", "1.21", "1.20.6", "1.20.4", "1.19.4"];
  }
};

const DOCKER_IMAGE = "itzg/minecraft-server";

export const createServerContainer = async (serverData: any) => {
  if (isSandbox) {
    mockState[serverData.id] = false;
    return "mock-container-id-" + serverData.id;
  }

  // Pull image if not exists
  console.log(`Ensuring ${DOCKER_IMAGE} is pulled...`);
  await new Promise((resolve, reject) => {
    docker.pull(DOCKER_IMAGE, (err: any, stream: any) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, onFinished, onProgress);
      function onFinished(err: any, output: any) {
        if (err) return reject(err);
        resolve(output);
      }
      function onProgress(event: any) {}
    });
  });

  const serverDir = path.join(process.cwd(), "data", "servers", serverData.id);
  await fs.ensureDir(serverDir);

  const container = await docker.createContainer({
    Image: DOCKER_IMAGE,
    name: `jtg-server-${serverData.id}`,
    Tty: true,
    OpenStdin: true,
    StdinOnce: false,
    Env: [
      `EULA=TRUE`,
      `TYPE=PAPER`,
      `VERSION=${serverData.version}`,
      `MEMORY=${serverData.ram}G`
    ],
    HostConfig: {
      PortBindings: {
        "25565/tcp": [
          {
            HostPort: `${serverData.port}`
          }
        ]
      },
      Binds: [`${serverDir}:/data`]
    }
  });

  return container.id;
};

export const startContainer = async (containerId: string) => {
  if (isSandbox) {
    const id = containerId.replace("mock-container-id-", "");
    mockState[id] = true;
    io.to(`server_${id}`).emit("log", `[System] Server started (Sandbox Mode).\r\n`);
    return;
  }
  const container = docker.getContainer(containerId);
  await container.start();
};

export const stopContainer = async (containerId: string) => {
  if (isSandbox) {
    const id = containerId.replace("mock-container-id-", "");
    mockState[id] = false;
    io.to(`server_${id}`).emit("log", `[System] Server stopped (Sandbox Mode).\r\n`);
    return;
  }
  const container = docker.getContainer(containerId);
  await container.stop();
};

export const restartContainer = async (containerId: string) => {
  if (isSandbox) {
    const id = containerId.replace("mock-container-id-", "");
    mockState[id] = true;
    io.to(`server_${id}`).emit("log", `[System] Server restarted (Sandbox Mode).\r\n`);
    return;
  }
  const container = docker.getContainer(containerId);
  await container.restart();
};

export const deleteContainer = async (containerId: string) => {
  if (isSandbox) {
    const id = containerId.replace("mock-container-id-", "");
    delete mockState[id];
    return;
  }
  const container = docker.getContainer(containerId);
  try {
    const info = await container.inspect();
    if (info.State.Running) {
      await container.stop();
    }
    await container.remove();
  } catch (err) {
    console.error("Error deleting container", err);
  }
};

export const getContainerStatus = async (containerId: string) => {
  if (isSandbox) {
    const id = containerId.replace("mock-container-id-", "");
    const isRunning = mockState[id] || false;
    return { State: { Running: isRunning, Status: isRunning ? "running" : "exited" } };
  }
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return info;
  } catch (e) {
    return null;
  }
};

const activeStreams: Record<string, NodeJS.ReadWriteStream> = {};

export const attachContainerSocket = async (containerId: string, serverId: string) => {
  if (isSandbox) {
    return;
  }
  try {
    const container = docker.getContainer(containerId);
    if (!activeStreams[containerId]) {
      const stream = await container.attach({ stream: true, stdout: true, stderr: true, stdin: true });
      activeStreams[containerId] = stream;
      stream.on('data', (chunk) => {
        io.to(`server_${serverId}`).emit("log", chunk.toString());
      });
      stream.on('end', () => {
        delete activeStreams[containerId];
      });
    }
  } catch(e) {
    console.error("Attach error", e);
  }
};

export const sendContainerCommand = async (containerId: string, command: string) => {
  if (isSandbox) {
    const id = containerId.replace("mock-container-id-", "");
    io.to(`server_${id}`).emit("log", `> ${command}\r\n`);
    return;
  }
  if (activeStreams[containerId]) {
    activeStreams[containerId].write(command + "\n");
  } else {
    try {
      const container = docker.getContainer(containerId);
      const stream = await container.attach({ stream: true, stdout: true, stderr: true, stdin: true });
      activeStreams[containerId] = stream;
      stream.write(command + "\n");
      stream.on('data', (chunk) => {
        // Will be broadcasted due to existing or new attach
      });
    } catch(e) {
       console.error("Command error", e);
    }
  }
};
