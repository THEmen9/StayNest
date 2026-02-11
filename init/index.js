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
    
    const newData = initData.data.map(listing => {
  if (listing.image) {
    listing.images = [listing.image]; // convert single → array
    delete listing.image;
  }
    listing.geometry = {
        type: "Point",
        coordinates: [77.1025, 28.7041] // Delhi test coords
      };

  return listing;
});
    await Listing.insertMany(newData);
    console.log("Listings imported successfully");
    process.exit(0);
  } catch (err) {
    console.error("Import error:", err);
    process.exit(1);
  }
}
