const express = require("express");
const app = express();
require('dotenv').config();
const homeRouter = require("./homeRouter"); // Importing the router
const mongoose = require('mongoose');
const db = mongoose.connection;
const bodyParser= require('body-parser')


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



mongoose.connect('mongodb://localhost:27017/password-auth')
// Handle MongoDB connection errors
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    console.log('MongoDB connected successfully')});


app.use(express.json());
app.set("view engine", "ejs");

app.use("/", homeRouter); // Using the router

const port = process.env.PORT || 3300;
app.listen(port, () => {
  console.log("Server is running on port 3300");
});
