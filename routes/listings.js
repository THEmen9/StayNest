const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const upload = require("../utils/multer");


router.get("/", async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.log(err);
        res.send("Error fetching listings");
    }
});

// 👉 New listing form
router.get("/new", async (req, res) => {
    try {
        res.render("listings/new.ejs");
    } catch (err) {
        console.log(err);
        res.send("Error loading new listing form");
    }
});

// Create new listing
router.post("/", upload.array("images"), async (req, res) => {

    try {
        const listingData = req.body.listing;

        // Attach uploaded image if provided
        if(req.files){
      newListing.images = req.files.map(f => ({
         url: f.path,
         filename: f.filename
      }));
   }
        newListing.geometry = {
            type: "Point",
            coordinates: [77.1025,28.7041] // dummy coords for now
            };
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
        const newListing = new Listing(listingData);
        await newListing.save();
        res.redirect("/listings");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error creating listing");
    }
});

// Show single listing
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/show.ejs", { listing });
    } catch (err) {
        console.log(err);
        res.send("Error fetching listing");
    }
});

// Edit form
router.get("/:id/edit", async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/edit.ejs", { listing });
    } catch (err) {
        console.log(err);
        res.send("Error fetching listing");
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.log(err);
        res.send("Error updating listing");
    }
});

// Delete listing
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndDelete(id);
        res.redirect("/listings");
    } catch (err) {
        console.log(err);
        res.send("Error deleting listing");
    }
});


module.exports = router;