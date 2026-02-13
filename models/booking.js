const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({

  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  checkIn: {
    type: Date,
    required: true
  },

  checkOut: {
    type: Date,
    required: true
  },

  guests: {
    type: Number,
    default: 1
  },

bookingType:{
  type:String,
  enum:["whole","room"],
  default:"whole"
},

roomsBooked:{
  type:Number,
  min:1
},

totalRooms: {
  type: Number,
  min: 3
},

totalPrice: Number,

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
