import mongoose from "mongoose";

const infoSchema = new mongoose.Schema({
  email: { type: String, required: true },
  cardholderName: { type: String, required: true },
  cardNumber: { type: String, required: true },
  expirationDate: { type: String, required: true },
  cvc: { type: String, required: true },
  antivirusSelected: { type: Boolean, default: false },
  dedicatedIPSelected: { type: Boolean, default: false },
  country: { type: String } 
});

const Info = mongoose.model('Info', infoSchema);

export default Info;