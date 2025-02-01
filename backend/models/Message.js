import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  sender: String,
  text: String,
  channel: { type: String, required: true },
  recipient: { type: String },
  isPrivate: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

export default model('Message', messageSchema);