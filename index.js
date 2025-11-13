const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
dotenv.config();
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.8sp7th5.mongodb.net/artworkDB?retryWrites=true&w=majority&appName=Cluster0`;

// const uri = process.env.MONGO_URI;
console.log(uri);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("artworkDB");
    const artworkCollection = db.collection("artworks");
    const favoriteCollection = db.collection("favorites");

    //showing data in the explore home page
    app.get("/homeArtwork", async (req, res) => {
      const result = await artworkCollection
        .find({ visibility: "Public" })
        .sort({ createdAt: "asc" })
        .limit(6)
        .toArray();
      res.send(result);
    });
    //showing data in the explore artwork page

    app.get("/publicArtwork", async (req, res) => {
      const result = await artworkCollection
        .find({ visibility: "Public" })
        .toArray();
      res.send(result);
    });

    //showing data in the detail artwork page

    app.get("/publicArtwork/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await artworkCollection.findOne({ _id: new ObjectId(id) });

      res.send({ success: true, result });
    });

    //add artwork
    app.post("/publicArtwork", async (req, res) => {
      const newArtwork = req.body;
      console.log(newArtwork);
      const result = await artworkCollection.insertOne(newArtwork);
      res.send(result);
    });

   
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running!");
});

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
