import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/water_quality';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  // Create indexes for efficient querying
  await db.collection('sensors').createIndex({ sensorId: 1 }, { unique: true });
  await db.collection('sensors').createIndex({ location: '2dsphere' });
  
  await db.collection('readings').createIndex({ sensorId: 1, timestamp: -1 });
  await db.collection('readings').createIndex({ timestamp: -1 });

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
