const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs'); // Import bcryptjs
require("dotenv").config();

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Member'],
    required: true,
  },
  avatarUrl: {
    type: String,
    default: 'https://i.pravatar.cc/150?u=' + Math.random().toString(36).substring(7), // Dynamic default avatar
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: function() { return this.role !== 'Admin'; } // Admin might not strictly belong to an org at creation
  },
  supervisorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role,
            organizationId: this.organizationId,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "10h" }
    );
};

const User = mongoose.model('User', userSchema);
module.exports = User;