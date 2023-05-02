import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express, { Request, Response } from "express";
import http from "http";
import { expressMiddleware } from "@apollo/server/express4";
import { config } from "dotenv";
import { schema } from "./graphql/schema";
config();

const PORT = process.env.PORT || 8000;
const startApolloServer = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    schema: schema,
    csrfPrevention: true,
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  app.use("/graphql", express.json(), expressMiddleware(server));

  app.get("/", (req: Request, res: Response) => {
    return res.json({
      name: "Apollo Server V4",
      version: "0.0.1",
    });
  });

  httpServer
    .listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    })
    .on("error", (err: any) => console.error(err));
};

startApolloServer();
