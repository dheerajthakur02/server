import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

const mongoURI = process.env.MONGODB_URI; // MongoDB Atlas URI from Vercel's environment variables

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  userHandle: String,
  imageUrls: [String], // Array to store multiple image URLs
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Server is working");
});

app.post("/add", async (req, res) => {
  const { name, userHandle, imageUrls } = req.body;

  try {
    let user = await User.findOne({ userHandle });

    if (user) {
      user.imageUrls = [...user.imageUrls, ...imageUrls];
      await user.save();
      res.status(200).send({ message: "User updated successfully" });
    } else {
      user = new User({ name, userHandle, imageUrls });
      await user.save();
      res.status(201).send({ message: "Successfully stored in database" });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to store data" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

export default app;
