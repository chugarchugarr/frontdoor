import net from "node:net";

const basePort = Number(process.env.PORT);

if (!Number.isInteger(basePort) || basePort <= 0) {
  console.error("PORT must be set to a valid TCP port before starting GatePass.");
  process.exit(1);
}

const ports = [
  { name: "Vite frontend", port: basePort },
  { name: "Hono API", port: basePort + 1 },
];

async function isPortOpen(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(false);
        return;
      }

      reject(error);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
}

const blocked = [];

for (const service of ports) {
  if (!(await isPortOpen(service.port))) {
    blocked.push(service);
  }
}

if (blocked.length > 0) {
  const summary = blocked
    .map((service) => `${service.name} port ${service.port}`)
    .join(", ");

  console.error(
    `GatePass is already running or has a stale process on ${summary}. Stop the existing process before starting another copy.`,
  );
  process.exit(1);
}
