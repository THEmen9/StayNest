const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

router.post("/listings/:id/book", isLoggedIn, async (req,res)=>{
console.log("BOOKING BODY:", req.body);

  const { id } = req.params;
  const { checkIn, checkOut, guests, bookingType, roomsBooked } = req.body;

  const listing = await Listing.findById(id);

  if(!listing){
    req.flash("error","Listing not found");
    return res.redirect("/listings");
  }

  /* ===== prevent self booking ===== */
  if(listing.owner.equals(req.user._id)){
    req.flash("error","You cannot book your own property");
    return res.redirect(`/listings/${id}`);
  }

  /* ===== ROOM VALIDATION ===== */
  let selectedRooms = 1;

  if(bookingType === "room"){

    selectedRooms = Number(roomsBooked) || 1;

    if(selectedRooms < 1){
      req.flash("error","Invalid room selection");
      return res.redirect(`/listings/${id}`);
    }

    if(selectedRooms > listing.totalRooms){
      req.flash("error","Selected rooms exceed available rooms");
      return res.redirect(`/listings/${id}`);
    }
  }

  /* ===== PRICE CALCULATION ===== */
  let totalPrice = listing.price;

  if(bookingType === "room"){
    const roomPrice = listing.price / listing.totalRooms;
    totalPrice = Math.round(roomPrice * selectedRooms);
  }

  /* ===== CREATE BOOKING ===== */
  const booking = new Booking({
    listing:id,
    user:req.user._id,
    checkIn,
    checkOut,
    guests,
    bookingType: bookingType || "whole",
    roomsBooked: selectedRooms,
    totalPrice
  });

  await booking.save();

  req.flash("success","Reservation Pending");
  res.redirect(`/listings/${id}?reserved=true`);
});

module.exports = router;
