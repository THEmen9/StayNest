const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

router.post("/listings/:id/book", isLoggedIn, async (req,res)=>{

  try {

    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.json({ success:false, message:"Listing not found" });
    }

    if (listing.owner.equals(req.user._id)) {
      return res.json({ success:false, message:"You cannot book your own property" });
    }

    const { checkIn, checkOut, guests, bookingType, roomsBooked } = req.body;

    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);

    //  STRONG TIME NORMALIZATION
    newCheckIn.setHours(0,0,0,0);
    newCheckOut.setHours(0,0,0,0);

    if (isNaN(newCheckIn) || isNaN(newCheckOut)) {
      return res.json({ success:false, message:"Invalid date format" });
    }

    if (newCheckIn >= newCheckOut) {
      return res.json({ success:false, message:"Invalid date selection" });
    }

    //  FIND OVERLAPPING BOOKINGS (Core logic)
    const overlappingBookings = await Booking.find({
      listing: id,
      status: "confirmed",
      checkIn: { $lt: newCheckOut },
      checkOut: { $gt: newCheckIn }
    });

    let selectedRooms = 1;

    if (bookingType === "room") {

      selectedRooms = Number(roomsBooked) || 1;

      if (selectedRooms < 1 || selectedRooms > listing.totalRooms) {
        return res.json({ success:false, message:"Invalid room selection" });
      }

      // If whole booking exists → block
      const wholeBooked = overlappingBookings.some(
        booking => booking.bookingType === "whole"
      );

      if (wholeBooked) {
        return res.json({ success:false, message:"Property fully reserved" });
      }

      // Count already booked rooms
      const roomsAlreadyBooked = overlappingBookings.reduce(
        (sum, booking) => sum + booking.roomsBooked,
        0
      );

      if (roomsAlreadyBooked + selectedRooms > listing.totalRooms) {
        return res.json({ success:false, message:"Not enough rooms available" });
      }

    } else {
      // Whole property booking
      if (overlappingBookings.length > 0) {
        return res.json({ success:false, message:"Already booked for selected dates" });
      }
    }

    //  PER-NIGHT CALCULATION
    const days = Math.ceil(
      (newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24)
    );

    let totalPrice;

    if (bookingType === "room") {
      const roomPrice = listing.price / listing.totalRooms;
      totalPrice = Math.round(roomPrice * selectedRooms * days);
    } else {
      totalPrice = listing.price * days;
    }

    const booking = new Booking({
      listing: id,
      user: req.user._id,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      guests: Number(guests) || 1,
      bookingType,
      roomsBooked: selectedRooms,
      totalPrice,
      status: "confirmed"
    });

    await booking.save();
    return res.json({
  success: true,
  message: "Stay reserved successfully"
});

  } catch (err) {
    console.error(err);
    return res.json({ success:false, message:"Server error" });
  }

});

router.get("/my-bookings", isLoggedIn, async (req, res) => {

  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("bookings/index", { bookings });

});

router.patch("/bookings/:id/cancel", isLoggedIn, async (req, res) => {

  const booking = await Booking.findById(req.params.id);

  if(!booking || !booking.user.equals(req.user._id)){
    return res.json({ success:false, message:"Unauthorized" });
  }

  booking.status = "cancelled";
  await booking.save();

  return res.json({ success:true, message:"Booking cancelled" });

});

router.delete("/bookings/:id", isLoggedIn, async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.json({ success: false });
    }

    if (!booking.user.equals(req.user._id)) {
      return res.json({ success: false });
    }

    await booking.deleteOne();

    return res.json({ success: true });

  } catch (err) {
    console.error("Delete error:", err);
    return res.json({ success: false });
  }

});


  module.exports = router;
