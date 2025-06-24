const express = require("express");
const cors = require("cors");
const { connectDatabase } = require("./config/database");
const corsOptions = require("./config/cors");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const faqRoutes = require("./routes/faqRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const port = process.env.PORT || 5000;
const hostname = "0.0.0.0";


// Middleware
app.use(cors(corsOptions));
app.use(express.json());

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
    app.use("/blogs", blogRoutes);
    app.use("/faqs", faqRoutes);
    app.use("/vouchers", voucherRoutes);
    app.use("/cart", cartRoutes);
    app.use("/order", orderRoutes);

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: "Internal Server Error" });
    });

    app.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
