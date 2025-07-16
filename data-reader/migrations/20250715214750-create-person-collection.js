module.exports = {
  async up(db, client) {
    await db.createCollection("people", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [
            "uuid",
            "name",
            "surname",
            "personalId",
            "status",
            "dateOfEntry",
            "pep",
            "os",
          ],
          properties: {
            uuid: { bsonType: "string" },
            name: { bsonType: "string", maxLength: 256 },
            surname: { bsonType: "string", maxLength: 256 },
            personalId: { bsonType: "string", maxLength: 10 },
            status: { enum: ["Activo", "Inactivo"] },
            dateOfEntry: { bsonType: "date" },
            pep: { bsonType: "bool" },
            os: { bsonType: "bool" },
          },
        },
      },
    });
    await db.collection("people").createIndex({ uuid: 1 }, { unique: true });
  },

  async down(db, client) {
    await db.collection("people").drop();
  },
};
