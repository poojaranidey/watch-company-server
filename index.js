const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.de956.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);
async function run() {
    try {
        await client.connect();
        const database = client.db('watchShop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('myorder');
        const reviewCollection = database.collection('review');
        const usersCollection = database.collection('users');

        // get products api
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // get single item
        app.get("/products/:id", async (req, res) => {
            const serviceId = req.params.id;
            console.log(serviceId);
            const result = await productCollection.findOne({
                _id: ObjectId(serviceId),
            });
            res.send(result);
        });

        // POST API
        app.post('/products', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service)
            const result = await productCollection.insertOne(service);

            res.json(result);
        });

        // DELETE API
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        });

        app.put('/myorder/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        app.post('/myorder', async (req, res) => {
            const newPlan = req.body
            const result = await orderCollection.insertOne(newPlan)
            res.json(result)
        })

        app.get('/myorder', async (req, res) => {
            const cursor = orderCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        app.delete('/myorder/:id', async (req, res) => {
            const id = req.params.id
            const cursor = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(cursor)
            res.json(result)
        });

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.post('/review', async (req, res) => {

            const service = req.body;
            console.log('hit the post api', service)

            const result = await reviewCollection.insertOne(service);

            res.json(result);

        });


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);

            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);


        })



    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running watch server');
});

app.listen(port, () => {
    console.log('running server on port', port);
})