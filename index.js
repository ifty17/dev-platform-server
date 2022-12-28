const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
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


//Save post to database
app.post('/post', async(req, res) => {
    const post = req.body;
    const result = await postCollection.insertOne(post);
    res.send(result);
})

//get all post
app.get('/posts', async(req, res) =>{
    const query = {};
    const cursor = postCollection.find(query);
    const posts = await cursor.sort({dateField: -1}).toArray();
    res.send(posts);
})

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