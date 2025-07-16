// MongoDB initialization script for data-reader
// This script runs when the MongoDB container starts for the first time

// Switch to the data-reader database
db = db.getSiblingDB("data-reader");

// Create a user for the data-reader application
db.createUser({
  user: "data-reader-user",
  pwd: "data-reader-password",
  roles: [
    {
      role: "readWrite",
      db: "data-reader",
    },
  ],
});

// Create collections with proper indexes
db.createCollection("people");
db.people.createIndex({ uuid: 1 }, { unique: true });
db.people.createIndex({ personalId: 1 }, { unique: true });

// Create a collection for tracking processing jobs
db.createCollection("processing-jobs");
db["processing-jobs"].createIndex({ createdAt: 1 });

print("MongoDB initialization completed successfully!");
print("Database: data-reader");
print("User: data-reader-user");
print("Collections: people, processing-jobs");
