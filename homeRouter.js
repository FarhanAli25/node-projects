const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const router = express.Router();
const secretKey = "secretKey"; // using dotenv for secret key
const User = require("./model/userSchema");

// Registering data
router.get("/register", (req, resp) => {
  resp.render("register");
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email) {
    console.log("Email required");
    return res.status(400).json({ error: "Email is required" });
  } else if (!password) {
    console.log("Password required");
    return res.status(400).json({ error: "Password is required" });
  } else if (password.length < 8) {
    console.log("Password must be at least 8 characters long");
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  try {
    // Check if email exists
    const existingUser = await User.findOne({ email:email});
    if (existingUser) {
      console.log("Email already exists");
      return res.status(400).json({ error: "Email already exists" });
    }

    // If email doesn't exist, proceed with user creation
    const addUser = new User({
      email,
      password,
    });

    await addUser.save();
    console.log("User registered successfully");
    console.log(addUser);
    res.redirect("/");
    console.log("Datat entered successfully")
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/forgot-password", (req, resp, next) => {
  resp.render("forgot-password");
});

router.post("/forgot-password", async (req, resp, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return resp.status(400).send("Email is required.");
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return resp.status(400).send("User with this email does not exist.");
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      secretKey,
      { expiresIn: "1m" }
    );

    const link = `http://localhost:3300/reset-password/${existingUser._id}/${token}`;

    resp.send("Password reset link: " + link);
  } catch (error) {
    console.error("Error:", error);
    resp.status(500).send("Internal Server Error");
  }
});

router.get("/reset-password/:id/:token", async (req, resp, next) => {
  const { id, token } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return resp.status(400).send("Invalid ID");
    }

    // Verify token
    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return resp.status(400).send("Invalid token");
      }

      resp.render("reset-password", { email: decoded.email });
    });
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Internal Server Error");
  }
});

router.post("/reset-password/:id/:token", async (req, resp, next) => {
  const { id, token } = req.params;
  const { password } = req.body; // Retrieve password from req.body

  try {
    const user = await User.findById(id);
    if (!user) {
      return resp.status(400).send("Invalid ID");
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return resp.status(400).send("Invalid token");
      }

      // Validate new password
      if (password.length < 8) {
        return resp
          .status(400)
          .send("Password must be at least 8 characters long.");
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password
      user.password = hashedPassword;
      await user.save();

      resp.send("Password updated successfully");
    });
  } catch (error) {
    console.error(error.message);
    resp.status(500).send("Internal Server Error");
  }
});

module.exports = router;
