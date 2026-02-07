console.log("Seeder started...");

const mongoose = require("mongoose");
const Listing = require("../models/listing");

console.log("TYPE OF Listing:", typeof Listing);
console.log("Listing value:", Listing);

const initData = require("./data");            

mongoose.connect("mongodb://127.0.0.1:27017/staynest")
.then(() => {
  console.log("Connected to MongoDB");
  importData();
})
.catch(err => console.log(err));

async function importData() {
  try {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Listings imported successfully");
    process.exit(0);
  } catch (err) {
    console.error("Import error:", err);
    process.exit(1);
  }
}
