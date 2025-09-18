const mongoose = require('mongoose');
const { Schema } = mongoose;

const querySchema = new Schema({
    taskId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Task",
    },
    raisedBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    message: {
        type: String, // Corrected typo here from 'tyep' to 'type'
        required: true,
        trim: true
    },
    visibleTo: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    responses: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            responderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            responseMessage: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    resolved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Query = mongoose.model('Query', querySchema);
module.exports = Query;