import "dotenv/config";
import { MongoClient } from "mongodb";
import pool from "./db.js";

const mongo = new MongoClient(process.env.MONGO_URI);

async function migrate() {
  try {
    // Connect to databases
    await mongo.connect();
    console.log("MongoDB connected");

    await pool.query("SELECT 1");
    console.log("PostgreSQL connected");

    const db = mongo.db();

    // Get all collections
    const collections = await db.listCollections().toArray();

    for (const item of collections) {
      const name = item.name;
      const collection = db.collection(name);

      // Get documents
      const documents = await collection.find({}).toArray();

      if (documents.length === 0) {
        console.log(`${name} is empty`);
        continue;
      }

      // Get all fields
      const fields = [
        ...new Set(documents.flatMap(doc => Object.keys(doc)))
      ];

      // Create table
      const columns = fields
        .map(field => `"${field}" TEXT`)
        .join(", ");

      await pool.query(`
        CREATE TABLE IF NOT EXISTS "${name}" (
          ${columns}
        )
      `);

      // Insert documents
      for (const doc of documents) {
        const values = fields.map(field => {
          const value = doc[field];

          if (value === undefined || value === null) {
            return null;
          }

          if (typeof value === "object") {
            return JSON.stringify(value);
          }

          return String(value);
        });

        const columns = fields
          .map(field => `"${field}"`)
          .join(", ");

        const placeholders = values
          .map((_, i) => `$${i + 1}`)
          .join(", ");

        await pool.query(
          `INSERT INTO "${name}" (${columns})
           VALUES (${placeholders})`,
          values
        );
      }

      console.log(`✅ ${name}: ${documents.length} documents migrated`);
    }

    console.log("🎉 Migration completed");

  } catch (error) {
    console.error("❌ Error:", error.message);

  } finally {
    await mongo.close();
    await pool.end();
  }
}

migrate();