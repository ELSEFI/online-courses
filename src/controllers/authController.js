const User = require("../models/User");
const jwt = require("jsonwebtoken");

const createToken = (id, role, tokenV) => {
  const payload = { id, role, tokenV };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email Already Exits" });
    user = new User({
      name,
      email,
      password,
      role,
    });
    await user.save();
    const token = createToken(user._id, user.role, user.tokenVersion);
    user.password = undefined;
    res.status(201).json({
      message: "Register Successfully",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Incorrect Email or Password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect Email or Password" });
    user.password = undefined;

    const token = createToken(user._id, user.role, user.tokenVersion);

    res.status(200).json({
      message: "Login Successfully",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User no exist." });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    user.tokenVersion += 1;
    await user.save();
    res.cookie("jwt", "LoggedOut", {
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 1000),
    });
    res.status(201).json({ message: "Logged out from all devices" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
