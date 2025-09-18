const jwt = require("jsonwebtoken");
require('dotenv').config();

const authToken = (req, res, next) => {
  const token = req.cookies?.token; // assuming you set cookie name = "token"
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // { id, role, organizationId, ... }
    console.log(req.user);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token",error: err.message });
  }
};

const authUser = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  next();
};

// Manager or Admin
const authManager = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "Manager") return res.status(403).json({ message: "Forbidden: Managers/Admins only" });
  next();
};

// Admin only
const authAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "Admin") return res.status(403).json({ message: "Forbidden: Admins only" });
  next();
};
// middleware/roleMiddleware.js
function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient role" });
      }
      next();
    } catch (err) {
      return res.status(500).json({ message: "Role validation failed", error: err.message });
    }
  };
};

module.exports = {authUser,authManager,authAdmin,authToken,roleMiddleware}
