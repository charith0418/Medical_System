const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

      // Extract user ID regardless of key name used during token creation
      const userId = decoded.userId || decoded.id || decoded._id;

      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user account not found" });
      }

      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token validation failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, missing bearer token" });
  }
};

const patientOnly = (req, res, next) => {
  if (req.user && req.user.role && req.user.role.toLowerCase() === "patient") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Patients only." });
};

module.exports = { protect, patientOnly };