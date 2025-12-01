const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protected = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.user.id).select("-password");
      if (!req.user)
        return res.status(401).json({ message: "User Not Exists" });
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Invalid or Expired Token" });
    }
  } else {
    res.status(401).json({ message: "Not authorized! Please Login." });
  }
};

module.exports = protected;
