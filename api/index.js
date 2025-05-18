const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");

const cors = require("cors");
const path = require("path");
const fs = require("fs");



// Modèle User Mongoose
const User = require("./models/User");

// Connexion MongoDB
mongoose.connect(
  process.env.MONGO_URL || "mongodb://localhost:27017/socialapp",
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log("Connected to MongoDB"))
 .catch(err => console.error("MongoDB connection error:", err));


// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir les images statiques
app.use("/api/public/images", express.static(path.join(__dirname, "public/images")));


const uploadRoute = require("./routes/upload");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
app.use("/api/upload", uploadRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

// Démarrage serveur
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}!`);
});
