const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");


router.put("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) return res.status(404).json("User not found");

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

// FOLLOW A USER
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId === req.params.id) {
    return res.status(403).json("You can't follow yourself");
  }

  try {
    const user = await User.findById(req.params.id); // cible
    const currentUser = await User.findById(req.body.userId); // celui qui suit

    if (!user || !currentUser) {
      return res.status(404).json("User not found");
    }

    if (user.followers.includes(currentUser._id)) {
      return res.status(403).json("You already follow this user");
    }

    user.followers.push(currentUser._id);
    currentUser.followings.push(user._id);

    await user.save();
    await currentUser.save();

    res.status(200).json("User has been followed");
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

// UNFOLLOW A USER
router.put("/:id/unfollow", async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.body.userId;

  if (currentUserId === targetUserId) {
    return res.status(403).json("You can't unfollow yourself");
  }

  try {
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json("User not found");
    }

    if (!targetUser.followers.includes(currentUserId)) {
      return res.status(403).json("You don't follow this user");
    }

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );
    currentUser.followings = currentUser.followings.filter(
      (id) => id.toString() !== targetUserId
    );

    await targetUser.save();
    await currentUser.save();

    res.status(200).json("User has been unfollowed");
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});


router.get("/random", async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5;
    const currentUserId = req.query.userId;

    if (!currentUserId) {
      return res.status(400).json({ message: "Paramètre userId requis" });
    }

    const currentUser = await User.findById(currentUserId).select("followers followings");
    if (!currentUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const excludedIds = new Set();
    excludedIds.add(currentUserId);

    currentUser.followers.forEach(id => excludedIds.add(id.toString()));
    currentUser.followings.forEach(id => excludedIds.add(id.toString()));

    const excludedObjectIds = Array.from(excludedIds).map(id => mongoose.Types.ObjectId(id));

    const randomUsers = await User.aggregate([
      { $match: { _id: { $nin: excludedObjectIds } } },
      { $sample: { size: count } },
      {
        $project: {
          password: 0,
          updatedAt: 0,
          __v: 0,
        }
      }
    ]);

    res.status(200).json(randomUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs random",
      error: err.message,
    });
  }
});
// route /users/search?query=quelquechose
router.get("/search", async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json({ message: "Query param required" });

    // Recherche simple sur le champ username (insensible à la casse)
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("-password -updatedAt -__v");

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recherche", error: err.message });
  }
});


module.exports = router;
