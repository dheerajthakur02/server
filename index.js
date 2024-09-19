import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const mongoURI = process.env.MONGODB_URI;
// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("Mongodb Atlas Database connected successfully"))
  .catch((err) => console.log(err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  userHandle: String,
  imageUrls: [String], // Array to store multiple image URLs
});

const User = mongoose.model("User", userSchema);

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
  res.send("<h1>Server is working</h1>");
});

// Add or Update User Route
app.post("/add", async (req, res) => {
  const { name, userHandle, imageUrls } = req.body;

  try {
    // Check if the user already exists by userHandle
    let user = await User.findOne({ userHandle });

    if (user) {
      // User exists, update the existing user's image URLs
      user.imageUrls = [...user.imageUrls, ...imageUrls]; // Append new image URLs to the existing ones
      await user.save();
      res.status(200).send({ message: "User updated successfully" });
    } else {
      // User does not exist, create a new user
      user = new User({ name, userHandle, imageUrls });
      await user.save();
      res.status(201).send({ message: "Successfully stored in database" });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to store data" });
  }
});

// Get Users Route
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

// Start the Server
app.listen(5000, () => {
  console.log("Server is running on port: 5000");
});
