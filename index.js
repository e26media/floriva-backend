const express= require('express');
const app=express();
const dotenv = require('dotenv');
const {
  corsMiddleware,
  helmetMiddleware,
  apiLimiter,
} = require('./Middlewares/security');

const mongoDB=require('./Config/db');
const productRoutes=require('./Router/productRoutes');
const categoryRoutes=require('./Router/categoryRoutes');
const orderRouter=require('./Router/orderRoutes');
const reviewRouter=require('./Router/reviewRouter');
const userRoutes=require('./Router/userRoutes');
const colorRoutes=require('./Router/colorRoutes');
const cartRoutes = require('./Router/cartRoutes');
const vendorRoutes  = require('./Router/vendorRoutes');
const featuredRoutes = require("./Router/featuredRoutes");
const CountryRouter = require("./Router/countryRouter");
const adminRoutes = require("./Router/adminRoutes");
const siteContentRoutes = require("./Router/siteContentRoutes");
const settingsRoutes = require("./Router/settingsRoutes");
const { seedDefaultAdmin } = require("./Controllers/adminController");
const { seedSiteContent } = require("./Controllers/siteContentController");
const { seedAdminSettings } = require("./Controllers/settingsController");




const path = require('path');
const fs = require('fs');
const port=7000;
dotenv.config()

app.set('trust proxy', 1);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(apiLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));



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

const siteContentDir = path.join(uploadsDir, 'site-content');
if (!fs.existsSync(siteContentDir)) {
  fs.mkdirSync(siteContentDir, { recursive: true });
  console.log('✓ Site content directory created');
}

app.use('/api',productRoutes);
app.use('/api',categoryRoutes);
app.use('/api',orderRouter);
app.use('/api',reviewRouter);
app.use('/api',userRoutes);
app.use('/api',colorRoutes);
app.use('/api', cartRoutes);
app.use('/api', vendorRoutes);
app.use('/api', featuredRoutes);
app.use('/api', CountryRouter);
app.use('/api', adminRoutes);
app.use('/api', siteContentRoutes);
app.use('/api', settingsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const message =
    status === 403 && String(err.message || '').includes('CORS')
      ? 'Request blocked'
      : isProd && status >= 500
        ? 'Internal server error'
        : err.message || 'Internal server error';

  res.status(status).json({ success: false, message });
});

mongoDB().then(async () => {
  await seedDefaultAdmin();
  await seedSiteContent();
  await seedAdminSettings();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});