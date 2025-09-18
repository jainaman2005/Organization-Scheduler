const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require("./user.model");

const organizationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, { timestamps: true });

// Middleware to delete users when org is deleted
organizationSchema.pre("findOneAndDelete", async function (next) {
  try {
    const orgId = this.getQuery()["_id"];
    // Also delete tasks associated with this organization
    await User.deleteMany({ organizationId: orgId });
    await require('./task.model').deleteMany({ organizationId: orgId }); // Ensure Task model is loaded
    await require('./query.model').deleteMany({ taskId: { $in: await require('./task.model').find({ organizationId: orgId }).select('_id') } }); // Delete queries related to tasks in this org
    next();
  } catch (err) {
    next(err);
  }
});

const Organization = mongoose.model('Organization', organizationSchema);
module.exports = Organization;