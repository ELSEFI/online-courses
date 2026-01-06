const Contact = require("../models/contactWithUs");
const { sendReplyEmail } = require("../services/emailSender");

exports.contactWithUs = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ message: "Please fill all fields" });

  try {
    const existing = await Contact.findOne({ email });
    if (existing)
      return res.status(400).json({
        message: "We already received your message",
      });

    await Contact.create({ name, email, message });

    res.status(200).json({
      message: "We will contact you soon",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find();
    if (messages.length === 0)
      return res.status(400).json({ message: "No Messages Yet!" });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId);
    if (!message)
      return res.status(400).json({ message: "No Message Founded" });

    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId).select(
      "email"
    );
    const { reply } = req.body;
    if (!reply)
      return res.status(400).json({ message: "You Must Fill a reply input" });
    await sendReplyEmail(message.email, reply);

    res.status(200).json({ message: "Reply sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteMessages = async (req, res) => {
  try {
    await Contact.deleteMany();
    res.status(200).json({ message: "Messages Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message Not Found" });
    await Contact.findByIdAndDelete(message._id);
    res.status(200).json({ message: "Message Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
