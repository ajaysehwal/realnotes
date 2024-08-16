import express, { Application, Request, Response } from "express";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cluster from "cluster";
import os from "os";
import { Server } from "http";
import process from "process";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import noteRoutes from "./routes/notes";
dotenv.config();

class App {
  public app: Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares() {
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100000,
        message: "Too many requests, please try again later.",
      })
    );
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(morgan("combined"));
    this.app.use(
      cors({
        origin: [process.env.FRONTEND_URL as string,'http://localhost:5173'],
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );
  }

  private initializeRoutes() {
    this.app.get("/", (req: Request, res: Response) => {
      res.status(200).json({ Health: "OK", Status: "running..",version:'v10' });
    });
    this.app.use("/api", authRoutes);
    this.app.use("/api/notes", noteRoutes);
  }

  public startServer(): Server {
    const server: Server = this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
    this.handleGracefulShutdown(server);
    return server;
  }

  private handleGracefulShutdown(server: Server) {
    process.on("SIGTERM", () => this.gracefulShutdown(server));
    process.on("SIGINT", () => this.gracefulShutdown(server));
  }

  private gracefulShutdown(server: Server) {
    console.log("Starting graceful shutdown...");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forcibly shutting down...");
      process.exit(1);
    }, 10000);
  }
}

class ClusterManager {
  private numCPUs: number;

  constructor() {
    this.numCPUs = os.cpus().length;
  }

  public start(appInstance: App) {
    // if (cluster.isPrimary && process.env.NODE_ENV === "production") {
    //   console.log(`Primary ${process.pid} is running`);

    //   for (let i = 0; i < this.numCPUs; i++) {
    //     cluster.fork();
    //   }

    //   cluster.on("exit", (worker) => {
    //     console.log(`Worker ${worker.process.pid} died, restarting...`);
    //     cluster.fork();
    //   });
    // } else {
    appInstance.startServer();
  }
}

(async () => {
  const app = new App();
  const clusterManager = new ClusterManager();
  clusterManager.start(app);
})();
