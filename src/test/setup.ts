import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    mongoose.connect(mongoUri).then(() => {
        console.log(`db connected`);
    }).catch((e) => {
        console.error(`failed to connect: ${e.message}`)
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});