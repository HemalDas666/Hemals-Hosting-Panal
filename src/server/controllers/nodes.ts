import { Request, Response } from "express";
import { readJSON, writeJSON } from "../services/db.js";
import { v4 as uuidv4 } from "uuid";

export const getNodes = async (req: Request, res: Response) => {
  const nodes = await readJSON("nodes.json") || [];
  res.json(nodes);
};

export const getNode = async (req: Request, res: Response) => {
  const { id } = req.params;
  const nodes = await readJSON("nodes.json") || [];
  const node = nodes.find((n: any) => n.id === id);
  if (!node) return res.status(404).json({ error: "Node not found" });
  res.json(node);
};

export const createNode = async (req: Request, res: Response) => {
  const { name, host, port, ram, disk, cpu } = req.body;
  if (!name || !host || !port || !ram || !disk) {
    return res.status(400).json({ error: "Missing required fields (name, host, port, ram, disk)" });
  }

  const nodes = await readJSON("nodes.json") || [];
  const node = {
    id: uuidv4(),
    name,
    host,
    port: Number(port),
    ram: Number(ram),
    disk: Number(disk),
    cpu: cpu ? Number(cpu) : 100,
    status: "offline",
    createdAt: new Date().toISOString(),
  };
  nodes.push(node);
  await writeJSON("nodes.json", nodes);
  res.json(node);
};

export const updateNode = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, host, port, ram, disk, cpu } = req.body;
  const nodes = await readJSON("nodes.json") || [];
  const index = nodes.findIndex((n: any) => n.id === id);
  if (index === -1) return res.status(404).json({ error: "Node not found" });

  if (name !== undefined) nodes[index].name = name;
  if (host !== undefined) nodes[index].host = host;
  if (port !== undefined) nodes[index].port = Number(port);
  if (ram !== undefined) nodes[index].ram = Number(ram);
  if (disk !== undefined) nodes[index].disk = Number(disk);
  if (cpu !== undefined) nodes[index].cpu = Number(cpu);

  await writeJSON("nodes.json", nodes);
  res.json(nodes[index]);
};

export const deleteNode = async (req: Request, res: Response) => {
  const { id } = req.params;
  let nodes = await readJSON("nodes.json") || [];
  nodes = nodes.filter((n: any) => n.id !== id);
  await writeJSON("nodes.json", nodes);
  res.json({ success: true });
};

export const checkNode = async (req: Request, res: Response) => {
  const { id } = req.params;
  const nodes = await readJSON("nodes.json") || [];
  const node = nodes.find((n: any) => n.id === id);
  if (!node) return res.status(404).json({ error: "Node not found" });

  const online = node.host === "127.0.0.1" || node.host === "localhost";
  node.status = online ? "online" : "offline";
  await writeJSON("nodes.json", nodes);
  res.json({ status: node.status });
};
