const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

app.engine("ejs", ejsMate);

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}


app.get("/", (req, res)=>{
    res.send("Hi, i am root");
})

app.get("/listings", async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
})

//New Route
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
});

//Create Route
app.post("/listings", wrapAsync(async(req, res, next)=>{
   
        let {title,description,image,price,country,location}=req.body;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    
}));

// show route
app.get("/listings/:id", async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
});

//Edit Route
app.get("/listings/:id/edit", async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

//Update Route
app.put("/listings/:id", async (req, res)=> {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {... req.body.listing});
    res.redirect(`/listings/${id}`);
});

//Delete route
app.delete("/listings/:id", async (req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute , Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });



app.use((err, req, res, next)=>{
    res.send("something went wrong!");
})

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});
