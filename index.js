const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const listingRoutes = require("./routes/listings");
const methodOverride = require("method-override");

const app = express();
const PORT = 5050;

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");
app.use(methodOverride("_method"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/listings", listingRoutes);

app.get("/", (req, res) => {
    res.send("StayNest running");
});

// Database connection
async function connectDB() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/staynest", {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 5000
        });
        console.log("MongoDB Connected");
    } catch (err) {
        console.log("Database connection error:", err.message);
    }
}

connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
