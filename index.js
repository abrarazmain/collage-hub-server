const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.mongoName}:${process.env.mongoPass}@cluster0.wa4fr1c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const collageCollection = client.db("collageHub").collection("allCollage");
    const submitCollection = client
      .db("collageHub")
      .collection("submitCollage");
    await collageCollection.createIndex({ collegeName: "text" });

    // all collage get

    app.get("/collages", async (req, res) => {
      const result = await collageCollection.find().toArray();
      res.send(result);
    });

    // singleCollage get
    app.get("/singleCollage/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const objectId = new ObjectId(id);
        const query = { _id: objectId };
        const result = await collageCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(400).send("Invalid ID");
      }
    });

    //   submit collage get
    app.get("/myCollages", async (req, res) => {
      const result = await submitCollection.find().toArray();
      res.send(result);
    });
    //   submit collage post
    app.post("/submitCollages", async (req, res) => {
      const newClass = req.body;
      const result = await submitCollection.insertOne(newClass);
      res.send(result);
    });

    // search collage
    app.get("/searchCollages/:name", async (req, res) => {
      const searchQuery = req.params.name;
      console.log(searchQuery);
      console.log(searchQuery);
      try {
        const regex = new RegExp(searchQuery, "i");
        const query = { collegeName: regex };
        const result = await collageCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error searching collages:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
