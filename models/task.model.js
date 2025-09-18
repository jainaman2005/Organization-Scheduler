const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Not Started', 'Ongoing', 'Partially Completed', 'Completed'],
    default: 'Not Started',
    required: true,
  },
  timeline: {
    type: Date,
    required: false
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
}, { timestamps: true });

// Pre-remove hook to delete associated queries when a task is deleted
taskSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        await require('./query.model').deleteMany({ taskId: this._id });
        next();
    } catch (err) {
        next(err);
    }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;