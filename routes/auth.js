import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Info from "../models/Info.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/subscribe", async (req, res) => {
  const {
    email,
    cardholderName,
    cardNumber,
    expirationDate,
    cvc,
    antivirusSelected,
    dedicatedIPSelected,
    country,
  } = req.body;

  try {
    const newSubscription = new Info({
      email,
      cardholderName,
      cardNumber,
      expirationDate,
      cvc,
      antivirusSelected,
      dedicatedIPSelected,
      country,
    });

    await newSubscription.save();
    return res.status(201).json({ message: "Subscription saved successfully", data: newSubscription, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error, unable to save subscription", success:false });
  }
});


router.get("/subscriptions", authenticateAdmin, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
     
      const users = await Info.find()
          .skip(skip)
          .limit(Number(limit));
          
      
      const totalCount = await Info.countDocuments();

      // Check if there are more pages
      const hasMore = totalCount > page * limit;

      res.status(200).json({
          data: users,
          hasMore, // Flag indicating if there are more pages
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error", success: false });
  }
});


router.get('/is-admin',authenticateAdmin, async (req,res,next)=>{
  return res.status(200).json({
    message: 'User authenticated',
    success:true
  })
})

export default router;
