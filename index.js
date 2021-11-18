const express=require('express')
const { MongoClient } = require('mongodb');
const ObjectId=require('mongodb').ObjectId;
const app=express();
const fileUpload=require('express-fileupload')
const cors=require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;
// middleware
app.use(cors())
app.use(express.json())
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.frk7m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database=client.db('carDatabase')
        const productsCollection=database.collection('products')
        const reviewsCollection=database.collection('reviews')
        const ordersCollection=database.collection('orders')
        const usersCollection = database.collection('users');
                // add product to mongodb
                app.post('/addProduct',async(req,res)=>{
                    const name=req.body.name;
                    const price=req.body.price;
                    const description=req.body.description;
                    const pic=req.files.image;
                    const picData=pic.data;
                    const encodedPic=picData.toString('base64');
                    const img=Buffer.from(encodedPic, 'base64');
                    const product={
                        name,
                        price,
                        description,
                        img

                    }
                   const result=await productsCollection.insertOne(product)
                     res.json(result)
                 })
                // add review to mongodb
                app.post('/review',async(req,res)=>{
                    const result=await reviewsCollection.insertOne(req.body)
                     .then(result=>{
                         res.json(result.insertedId)
                     })
                 })
                //  add users to the dartabase
                 app.post('/users', async (req, res) => {
                    const user = req.body;
                    const result = await usersCollection.insertOne(user);
                    res.json(result);
                });
         //   get all products 
           app.get('/products',async(req,res)=>{
          const result=await productsCollection.find({}).toArray();
         res.send(result)
       
    })
         //   get all reviews 
           app.get('/review',async(req,res)=>{
          const result=await reviewsCollection.find({}).toArray();
         res.send(result)
       
    })
                // get product details
                app.get('/products/:id',async(req,res)=>{
                    const id=req.params.id;
                    const query={_id: ObjectId(id)}
                    const product=await productsCollection.findOne(query)
                    res.json(product)
        
                })
                //  add order
        app.post('/products/:id',async(req,res)=>{
            const result=await ordersCollection.insertOne(req.body)
             .then(result=>{
                 
                 res.send(result.insertedId)
             })
         })
        // get own order
    app.get('/myOrders/',async(req,res)=>{
        const result=await ordersCollection.find({}).toArray();
        res.send(result)
    })
      //   manage all orders
       app.get('/manageAllOrder',async(req,res)=>{
        const result=await ordersCollection.find({}).toArray();
       res.send(result)     
        })
         // delete order
         
        app.delete('/manageAllOrder/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: ObjectId(id)}
      const result=await ordersCollection.deleteOne(query);
      res.json(result)
       })
    //    admin role create
    app.put('/users/admin', async (req, res) => {
       const user=req.body;
       const filter={email: user?.email}
       const updateDoc={$set: {role: 'admin'}}
       const result=await usersCollection.updateOne(filter,updateDoc)
       res.json(result)
    })
    // checking admin role
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

      

    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir)

app.get('/',(req,res)=>{
    res.send('Smart Car server is running')
})

app.listen(port,()=>{
    console.log('Smart Car server is running',port)
})