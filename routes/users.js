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
router.get("/login",redirectIfLoggedIn,(req,res)=>{
   res.render("users/login.ejs");
});

// Login User
router.post("/login",
   passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true
   }),
   (req,res,)=>{
      req.flash("success","Welcome back!");
      res.redirect("/listings");
   }
);


// LogOut User
router.get("/logout",(req,res,)=>{
    console.log("LOGOUT ROUTE HIT");
 req.logout((err)=>{
      if(err) return next(err);
      req.flash("success","Logged out!");
      res.redirect("/login");
   });
});

module.exports = router;
