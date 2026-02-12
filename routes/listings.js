
const express = require('express');
const router = express.Router();

const Listing = require('../models/listing');
const upload = require("../utils/multer");
const { isLoggedIn, isOwner } = require("../middleware");
// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// const mapToken = process.env.MAP_TOKEN;
// const geocoder = mbxGeocoding({ accessToken: mapToken });



router.get("/", async (req,res)=>{
   let { search } = req.query;
   let filter = {};

   if(search){
      filter.title = { $regex: search, $options: "i" };
   }

   let allListings = await Listing.find(filter).populate("owner");

   res.render("listings/index",{ allListings });
});


// New listing form
router.get("/new",isLoggedIn, async (req, res) => {
    try {
        res.render("listings/new.ejs");
    } catch (err) {
        console.log(err);
        res.send("Error loading new listing form");
    }
});

// Create new listing
router.post("/",isLoggedIn, upload.array("images"), async (req, res) => {
    try {
        console.log("FILES:", req.files);
        const listingData = req.body.listing;

        //  free geocoding
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${listingData.location}`
        );
        const data = await response.json();

        //  create first
        const newListing = new Listing(listingData);
        newListing.owner = req.user._id;

        // Images
        newListing.images = [];

        // uploads
        if (req.files && req.files.length > 0) {
            newListing.images = req.files.map(f => ({
                url: "uploads/" + f.filename,
                filename: f.filename
            }));
        }
        // image Url
        if (listingData.image && listingData.image.url) {
            newListing.images.push({
                url: listingData.image.url,
                filename: "link-image"
            });
        }

        // Geometry after creation
        newListing.geometry = {
            type: "Point",
            coordinates: [
                data[0].lon,
                data[0].lat
            ]
        };

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
        const listing = await Listing.findById(id).populate("owner");
           console.log("IMAGES:", listing.images);
        res.render("listings/show.ejs", { listing });
    } catch (err) {
        console.log(err);
        res.send("Error fetching listing");
    }
});

// Edit form
router.get("/:id/edit",isLoggedIn, isOwner, async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/edit.ejs", { listing });
    } catch (err) {
        console.log(err);
        res.send("Error fetching listing");
    }
});

router.put("/:id",isLoggedIn, isOwner, async (req, res) => {
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
router.delete("/:id",isLoggedIn, isOwner, async (req, res) => {
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