import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema(
  {
    userAgent: { type: [String], default: [] }, 
    totalClicks: { type: Number, default: 0 },
    userClicks: { type: Number, default: 0 },
    totalTraffic: { type: Number, default: 0 },
    totalUser: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Tracking = mongoose.model("Tracking", trackingSchema);

export default Tracking;
