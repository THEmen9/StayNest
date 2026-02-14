console.log("USERS ROUTE LOADED");
const { redirectIfLoggedIn } = require("../middleware");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");


// Register Form
router.get("/signup", (req, res)=>{
   res.render("users/signup.ejs");
});

// Register User
router.post("/signup", async(req,res)=>{
   try{
      const { username,email,password } = req.body;
      const newUser = new User({ username,email,password });
      await newUser.save();
      req.flash("success","Account created! Please login.");
      res.redirect("/login");
   }catch(err){
      req.flash("error",err.message);
      res.redirect("/signup");
   }
});


// Login Form 
router.get("/login", redirectIfLoggedIn, (req, res) => {
   res.render("users/login");
});

// Login User
router.post("/login", (req, res, next) => {

  passport.authenticate("local", (err, user, info) => {

    if (err) {
      return res.json({ success: false, message: "Server error" });
    }

    if (!user) {
      return res.json({ success: false, message: info?.message || "Invalid credentials" });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.json({ success: false, message: "Login failed" });
      }

      return res.json({ success: true, message: "Logged In" });
    });

  })(req, res, next);

});



// LogOut User
router.get("/logout", (req, res, next) => {

   req.logout((err) => {
      if (err) return next(err);

      res.redirect("/login");
   });

});


module.exports = router;
