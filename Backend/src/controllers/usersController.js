const instructorProfile = require("../models/instructorProfile");
const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 });
    if (users.length === 0)
      return res.status(404).json({ message: "No Users" });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).json({ message: "No User With That Id" });

    if (user.role === "admin" || user.role === "instructor")
      return res.status(400).json({ message: "That Id Not Regular User" });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.addUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All Inputs Required" });

  try {
    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ message: "User Already Signed Up" });

    user = new User({
      name,
      email,
      password,
      emailVerified: true,
    });
    await user.save();

    res.status(200).json({ message: "User Created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "Not User Founded" });

    user.status = !user.status;
    await user.save();
    res.status(200).json({ message: "User Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).json({ message: "User Not Founded" });
    const instructor = await instructorProfile.findOne({ userId: user._id });
    if (!instructor) {
      await User.findByIdAndDelete(user._id);
      return res.status(200).json({ message: "User Deleted Successfully" });
    }

    await instructorProfile.findByIdAndDelete(instructor._id);
    await User.findByIdAndDelete(user._id);

    res.status(200).json({ message: "User Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
