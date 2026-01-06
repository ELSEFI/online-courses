const getAuthToken = require("../services/getPaymentToken");
const createOrder = require("../services/createOrder");
const createPaymentKey = require("../services/createPaymentKey");
const verifyPaymobHmac = require("../services/paymobHmac");
const { sendEnrollmentEmail } = require("../services/emailSender");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/payment");
const User = require("../models/User");

exports.createPayment = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  try {
    const course = await Course.findById(courseId);
    if (!course || !course.isPublished || !course.status)
      return res.status(400).json({ message: "Invalid course" });

    const enrolled = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });
    if (enrolled) return res.status(400).json({ message: "Already enrolled" });

    const payment = await Payment.create({
      user: userId,
      course: courseId,
      amount: course.price,
      status: course.price === 0 ? "paid" : "pending",
    });

    if (course.price === 0) {
      await Enrollment.create({ user: userId, course: courseId });
      return res.json({ message: "Enrolled Successfully" });
    }

    const authToken = await getAuthToken();
    const orderId = await createOrder(authToken, course.price, payment._id);

    payment.merchantOrderId = orderId;
    await payment.save();

    const paymentKey = await createPaymentKey(authToken, orderId, course.price);

    res.json({
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME}?payment_token=${paymentKey}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment failed" });
  }
};

exports.payMobWebhook = async (req, res) => {
  try {
    const isValid = verifyPaymobHmac(req);
    if (!isValid) return res.sendStatus(403);

    const data = req.body.obj;
    const merchantOrderId = data.order.merchant_order_id;
    const success = data.success;

    const payment = await Payment.findOne({ merchantOrderId });
    if (!payment) return res.sendStatus(404);

    if (success && payment.status !== "paid") {
      payment.status = "paid";
      payment.paidAt = new Date();
      await payment.save();

      const exists = await Enrollment.findOne({
        user: payment.user,
        course: payment.course,
      });

      if (!exists) {
        await Enrollment.create({
          user: payment.user,
          course: payment.course,
        });
        const user = await User.findById(payment.user);
        const course = await Course.findById(payment.course);
        await sendEnrollmentEmail({ user, course });
      }
    }

    if (!success) {
      payment.status = "failed";
      await payment.save();
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};
