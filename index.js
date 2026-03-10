const express= require('express');
const app=express();
const dotenv = require('dotenv');
const cors = require("cors");

const mongoDB=require('./Config/db');
const productRoutes=require('./Router/productRoutes');
const categoryRoutes=require('./Router/categoryRoutes');
const orderRouter=require('./Router/orderRoutes');
const reviewRouter=require('./Router/reviewRouter');
const userRoutes=require('./Router/userRoutes');
const colorRoutes=require('./Router/colorRoutes');
const cartRoutes = require('./Router/cartRoutes');





const path = require('path');
const fs = require('fs');
const port=7000;
dotenv.config()

app.use(express.json());
app.use(cors());


app.use(express.urlencoded({ extended: true }));



const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Uploads directory created');
}

const productsDir = path.join(uploadsDir, 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
  console.log('✓ Products directory created');
}

app.use('/api',productRoutes);
app.use('/api',categoryRoutes);
app.use('/api',orderRouter);
app.use('/api',reviewRouter);
app.use('/api',userRoutes);
app.use('/api',colorRoutes);
app.use('/api', cartRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



mongoDB()
app.listen(port,()=>{
    console.log(`Server running on port ${port}`); 
})