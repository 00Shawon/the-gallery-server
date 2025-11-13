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

     // MY artwork page
    app.get("/myArtwork", async (req, res) => {
      const artist_email = req.query.email;
      const query = {};

      if (artist_email) {
        query.artist_email = artist_email;
      }
      const result = await artworkCollection.find(query).toArray();
      res.send(result);
    });

    //search implement
    app.get('/search', async(req,res)=> {
      const searchText = req.query.search
      const result = await artworkCollection.find({title:{$regex:searchText, $options:'i'}}).toArray()
      res.send(result)
    })

    
    //update artwork
    app.put("/myArtwork/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(data);
      console.log(id);
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const update = {
        $set: data,
      };
      const result = await artworkCollection.updateOne(filter, update);
      res.send({
        success: true,
        result,
      });
    });
// Like an artwork
app.patch('/artworks/:id/like', async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };

    const update = { $inc: { likes: 1 } };

    // Update the like count
    const result = await artworkCollection.updateOne(filter, update);

    if (result.modifiedCount > 0) {
      // Fetch the updated document to return new like count
      const updatedArtwork = await artworkCollection.findOne(filter);
      res.send({ success: true, likes: updatedArtwork.likes });
    } else {
      res.status(404).send({ success: false, message: "Artwork not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});

        //delete artwork
    app.delete("/myArtwork/:id", async (req, res) => {
      const id = req.params.id;
      const result = await artworkCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send({
        success: true,
        result,
      });
    });
  //get favorite

    app.get("/myFavorites", async (req, res) => {
      const artist_email = req.query.email;

      const result = await favoriteCollection
        .find({ downloaded_by: artist_email })
        .toArray();
      res.send(result);
    });

     //add to favorite
    app.post("/favorites", async (req, res) => {
      try {
        const data = req.body;
        console.log("Received data:", data);

        if (!data || Object.keys(data).length === 0) {
          return res.status(400).send({ message: "No data provided" });
        }

        // Remove _id to avoid duplicate key error
        const { _id, ...favoriteData } = data;

        const result = await favoriteCollection.insertOne(favoriteData);

        res.send({ success: true, result });
      } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).send({ message: "Internal Server Error", error });
      }
    });
//delete from fav
       app.delete("/favorites/:id", async (req, res) => {
      const id = req.params.id;
      const result = await artworkCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send({
        success: true,
        result,
      });
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
