import { Schema, model } from 'mongoose';

const channelSchema = new Schema({
    name: { type: String, required: true, unique: true },
    messages: [
        {
            sender: String,
            text: String,
            timestamp: { type: Date, default: Date.now },
        },
    ],
    users: [String],
    isPrivate: { type: Boolean, default: false },
});

export default model('Channel', channelSchema);
