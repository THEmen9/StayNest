const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },

    images: [
   {
      url: String,
      filename: String
   }
],
    price:{
        type: Number,
        required: true,
    },
    location:{
        type: String,
        required: true,
    },
    country:String,

   geometry: {
    type: {
        type: String,
        enum: ["Point"],
        required: true
    },
     coordinates: [Number]
}
    
});



const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;