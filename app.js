const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { application } = require("express");

const app = express();
const port = 5000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/WilliesDB");

// ### Dish
const dishSchema = new mongoose.Schema({
  name: String,
  description: String,
  side: String,
  isVeggie: Boolean,
});
const Dish = mongoose.model("Dish", dishSchema);

// ------------------------------------------------
// ### User ###
const userSchema = new mongoose.Schema({
  name: String,
});

const User = mongoose.model("User", userSchema);

const demoUser = new User({
  name: "Karla",
});
// demoUser.save();

// ### Tagesmenü
const dailyMenuSchema = new mongoose.Schema({
  date: Date,
  meat: { type: mongoose.Schema.Types.ObjectId, ref: "Dish" },
  veggie: { type: mongoose.Schema.Types.ObjectId, ref: "Dish" },
});

const DailyMenu = mongoose.model("DailyMenu", dailyMenuSchema);

// ------------------------------------------------
// ###Reservation
const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dish: { type: mongoose.Schema.Types.ObjectId, ref: "Dish" },
});

const Reservation = mongoose.model("Reservation", reservationSchema);

// const res = new Reservation({
//     user: demoUser,
//     dish: demoDish
// })
// res.save();

app.get("/", (req, res) => {
  res.redirect("/today");
});

// show todays menu
app.get("/today", (req, res) => {
  var start = new Date();
  start.setHours(0, 0, 0, 0);

  var end = new Date();
  end.setHours(23, 59, 59, 999);

  // Hier weiter: Finde Tagesmenü mithilfe des aktuellen Datums!
  DailyMenu.findOne({ date: {$gte: start, $lt: end} }, (err, dm) => {
    console.log(dm);
    res.render("todaysMenu", {
      date: new Date().toLocaleDateString(),
      menu: dm,
    });
  }).populate(["meat", "veggie"]);
});

app.get("/dishes/add", (req, res) => {
  res.render("addDishForm");
});
app.post("/dishes/add", (req, res) => {
  const data = req.body;
  console.log(data);

  const newDish = new Dish({
    name: data.dishname,
    description: data.description,
    side: data.side,
    isVeggie: data.isVeggie || false,
  });

  newDish.save();
  res.render("addDishFormSuccess", {
    name: data.dishname,
    description: data.description,
    side: data.side,
    isVeggie: data.isVeggie || false,
  });
});

app.get("/dishes/show", (req, res) => {
  Dish.find({}, function (err, dishes) {
    res.render("showDishes", { dishes });
  });
});

app.post("/dishes/delete/:id", (req, res)=>{
    console.log(req.params);
    Dish.findByIdAndRemove(req.params.id, (err, doc)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/admin/gerichte");
        }
    }); // executes

})

app.listen(port, () => {
  console.log("server started at port 5000");
});
