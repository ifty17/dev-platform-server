const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3e0xlo7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


async function run(){
try{
  const usersCollection = client.db("dev-platform").collection("users");
  const postCollection = client.db("dev-platform").collection("post");
  const commentsCollection = client.db("dev-platform").collection("comments");

//get comments of post
app.get("/commentsbyid", async (req, res) => {
  let query = {};
  if (req.query.commentId) {
    query = {
      commentId: req.query.commentId,
    };
  }
  const result = commentsCollection.find(query).sort({ dateField: -1 });
  const comments = await result.toArray();
  res.send(comments);
});


  //post comments to db
    app.post("/comments", async (req, res) => {
      const post = req.body;
      const result = await commentsCollection.insertOne(post);
      res.send(result);
    });


  //get user by id
  app.get("/users/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const user = await usersCollection.findOne(query);
    res.send(user);
  });


  //update user ifo api
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const user = req.body;
      const option = { upsert: true };
      const updatedUser = {
        $set: {
          title: user.title,
          institution: user.institution,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedUser,
        option
      );
      res.send(result);
    });


  //update like info api
    app.put("/feeds/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const post = req.body;
      console.log(post);
      const option = { upsert: true };
      const updatedReactions = {
        $set: {
          reactions: post.like,
        },
      };
      const result = await postCollection.updateOne(
        filter,
        updatedReactions,
        option
      );
      res.send(result);
    });

    // get most reacted post
    app.get('/mostreacted', async(req, res) =>{
        const query = {};
        const result = await postCollection.find(query);
        const post = await result.limit(3).sort({reactions: -1}).toArray();
        res.send(post);
    })


  //Save post to database
  app.post("/post", async (req, res) => {
    const post = req.body;
    const result = await postCollection.insertOne(post);
    res.send(result);
  });

  //get users
  app.get("/users", async (req, res) => {
    const email = req.query.email;
    const query = {
      email: email,
    };
    const result = await usersCollection.find(query).toArray();
    res.send(result);
  });

  //get all post
  app.get("/posts", async (req, res) => {
    const query = {};
    const cursor = postCollection.find(query);
    const posts = await cursor.sort({ dateField: -1 }).toArray();
    res.send(posts);
  });

  //get details post
  app.get("/post/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await postCollection.findOne(query);
    res.send(result);
  });

  // Save users to database
  app.post("/users", async (req, res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.send(result);
  });
}

finally{

}

}
run().catch(console.log);



app.get("/", (req, res) => {
  res.send("Dev platform running");
});

app.listen(port, () => console.log(`Dev platform running on port ${port}`));