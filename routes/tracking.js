import { authenticateAdmin } from "../middleware/auth.js";
import Tracking from "../models/Track.js";
import express from "express";
const router = express.Router();

router.post("/traffic", async (req, res) => {
  try {
    const { userAgent } = req.body;

    let existingUser = await Tracking.findOne({ userAgent });

    if (!existingUser) {
      existingUser = new Tracking({ userAgent });
      await existingUser.save();
      await Tracking.updateMany({}, { $inc: { totalTraffic: 1, totalUser: 1 } });
    } else {
      await Tracking.updateOne({ _id: existingUser._id }, { $inc: { totalTraffic: 1 } });
    }
    

    res.status(200).json({ message: "Traffic tracked successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while tracking the traffic." });
  }
});

router.post("/click", async (req, res) => {
    try {
      const { userAgent } = req.body;
  
      let existingUser = await Tracking.findOne({ userAgent });
  
      if (!existingUser) {
        existingUser = new Tracking({
          userAgent,
          totalClicks: 1,
          userClicks: 1, // User click is counted only once when the user is new
        });
        await existingUser.save();
        await Tracking.updateMany({}, { $inc: { totalClicks: 1, totalUser: 1 } });
      } else {
        // Only increment totalClicks for every click
        await Tracking.updateOne({ _id: existingUser._id }, { $inc: { totalClicks: 1 } });
      }
  
      res.status(200).json({ message: "Click tracked successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while tracking the click." });
    }
  });
  

router.get("/stats", authenticateAdmin, async (req, res) => {
    try {
      const stats = await Tracking.findOne({});
      if (stats) {
        res.status(200).json({
          totalClicks: stats.totalClicks,
          userClicks: stats.userClicks,
          totalTraffic: stats.totalTraffic,
          totalUser: stats.totalUser,
        });
      } else {
        res.status(404).json({ message: "No tracking data found." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while fetching the stats." });
    }
  });
export default router;
