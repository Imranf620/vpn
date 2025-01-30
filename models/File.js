import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  downloads: { type: Number, default: 0 },

}, {
  timestamps: true,
});

export default mongoose.model("File", fileSchema);
