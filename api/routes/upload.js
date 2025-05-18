const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || req.query.type;
    if (type === "profile") {
      cb(null, "public/images/person");
    } else if (type === "post") {
      cb(null, "public/images/post");
    } else {
      cb(null, "public/images");
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .jpg, .png
    let basename = path.basename(file.originalname, ext);

    // Nettoyage du nom
    basename = basename
      .toLowerCase()
      .replace(/\s+/g, "-") // remplace les espaces par des tirets
      .replace(/[^a-z0-9\-]/g, ""); // supprime caractères spéciaux

    // Ajout d’un suffixe pour éviter les conflits
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const newFilename = `${basename}-${uniqueSuffix}${ext}`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage });

// Route d'upload d'image
router.post("/a/", upload.single("image"), async (req, res) => {
  try {
    const type = req.body.type || req.query.type;
    const userId = req.body.userId || req.query.userId;

    if (!userId || !type) return res.status(400).json("Missing userId or type");
    if (!req.file) return res.status(400).json("No file uploaded");

    const fileName = req.file.filename;

    const update =
      type === "profile"
        ? { profilePicture: fileName }
        : { coverPicture: fileName };

    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    });

    if (!updatedUser) return res.status(404).json("User not found");

    res.status(200).json({
      message: "Image uploaded and user updated successfully",
      filename: fileName, // 🔥 retourné au client
      filePath: update.profilePicture || update.coverPicture,
    });
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ message: "Erreur interne", error: err.message });
  }
});

module.exports = router;
