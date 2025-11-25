const mongoose = require("mongoose");
const Product = require("./models/Product");

// import data
const { products } = require("./data/products");

async function migrate() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/atomy", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    for (const item of products) {
      await Product.findOneAndUpdate(
        { id: item.id },
        item,
        { upsert: true, new: true }
      );
    }

    console.log("Migration complete!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();