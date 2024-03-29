const { MongoClient } = require("mongodb");

async function connectToDatabase() {
  const client = await MongoClient.connect(process.env.DATABASE_URL, {
  });

  const db = client.db("GamingCentral");

  return {
    client,
    db,
  };
}

async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

async function createDocument(collectionName, document) {
  const collection = await getCollection(collectionName);
  const result = await collection.insertOne(document);
  return;
}

async function findDocuments(collectionName, filter = {}) {
  try {
    const collection = await getCollection(collectionName);
    return collection.find(filter).toArray();
  } catch (err) {
    console.error("Error finding documents:", err);
    throw err;
  }
}

async function updateDocument(collectionName, filter, update) {
  const collection = await getCollection(collectionName);
  const result = await collection.findOneAndUpdate(
    filter,
    { $set: update },
    { returnOriginal: false }
  );
  return result.value;
}

async function deleteDocument(collectionName, filter) {
  const collection = await getCollection(collectionName);
  const result = await collection.deleteOne(filter);
  return result.deletedCount === 1;
}

module.exports = {
  createDocument,
  findDocuments,
  updateDocument,
  deleteDocument,
};
