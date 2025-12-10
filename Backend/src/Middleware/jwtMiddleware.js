const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protected = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (!token || token.trim() === "" || token === "undefined" || token === "null") {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || decoded.tokenV !== user.tokenVersion) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err);
    req.user = null;
    next();
  }
};

module.exports = protected;
