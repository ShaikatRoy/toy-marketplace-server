const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d8mhnco.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db('figureMania').collection('toys');

    // toys
    app.get('/toys', async (req, res) => {
        const { email, sort } = req.query;
      
        let query = {};
        if (email) {
          query = { email };
        }
      
        let sortQuery = { price: 1 }; 
        if (sort === 'desc') {
          sortQuery = { price: -1 }; 
        }
      
        const result = await toyCollection.find(query).sort(sortQuery).toArray();
        res.json(result);
      });
   
      


    app.get('/toys/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }

        const options = {
            projection: { 
                photo: 1, 
                toyName:1, 
                userName:1,
                email: 1,
                subCategory: 1,
                price: 1,
                rating: 1,
                quantity:1,
                description: 1
                },
        };
        const result = await toyCollection.findOne(query, options);
        res.send(result);
    })

 
    app.post('/toys', async (req, res) => {
        const toy = req.body;
        console.log(toy);
        const result = await toyCollection.insertOne(toy);
        res.send(result);
    });

    app.delete('/toys/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await toyCollection.deleteOne(query);
        res.send(result);
    })

    app.patch('/toys/:id', async (req, res) => {
        const id = req.params.id;
        const updatedToy = req.body;
        
        const query = { _id: new ObjectId(id) };
        const update = {
          $set: {
            price: updatedToy.price,
            quantity: updatedToy.quantity,
            description: updatedToy.description
          }
        };
        
        try {
          const result = await toyCollection.updateOne(query, update);
          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send('Error updating toy.');
        }
      });
      
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('figure mania is running')
})

app.listen(port, () => {
    console.log(`figure mania server is running on port ${port}`)
})