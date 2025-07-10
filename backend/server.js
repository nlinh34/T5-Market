const express = require("express");
const cors = require("cors");
const { connectDatabase } = require("./config/database");
const corsOptions = require("./config/cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shopRoutes = require("./routes/shopRoutes");
const reviewRoutes = require("./routes/reviewRoutes")

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// Connect to Database
connectDatabase()
  .then(() => {
    app.get("/test", (req, res) => {
      res.json({ message: "CORS test successful" });
    });

    // Routes
    app.use("/auth", userRoutes);
    app.use("/products", productRoutes);
    app.use("/categories", categoryRoutes);
    app.use("/vouchers", voucherRoutes);
    app.use("/cart", cartRoutes);
    app.use("/order", orderRoutes);
    app.use("/shop", shopRoutes);
    app.use("/review", reviewRoutes)

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: "Internal Server Error" });
    });

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });

  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
