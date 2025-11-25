const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db")

const app = express();
app.use(cors());
app.use(express.json());

// Connect ke MongoDB
connectDB()

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Auth Route
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Product Route
const productRoutes = require("./routes/products");
app.use("/api/products", productRoutes);

// Cart Route
const cartRoutes = require("./routes/cart");
app.use("/api/cart", cartRoutes);

// Order Route (Checkout)
const orderRoutes = require("./routes/order");
app.use("/api/order", orderRoutes);

// Midtrans Route
const midtransRoutes = require("./routes/midtrans");
app.use('/api/midtrans', midtransRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));