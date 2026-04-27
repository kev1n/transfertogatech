import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

export interface TestMongo {
  client: MongoClient;
  server: MongoMemoryServer;
  stop: () => Promise<void>;
}

/**
 * Spins up an in-memory Mongo and a connected MongoClient. Callers own
 * lifecycle — always call `stop()` in afterEach/afterAll.
 */
export async function startTestMongo(): Promise<TestMongo> {
  const server = await MongoMemoryServer.create();
  const client = new MongoClient(server.getUri());
  await client.connect();
  return {
    client,
    server,
    stop: async () => {
      await client.close();
      await server.stop();
    },
  };
}
