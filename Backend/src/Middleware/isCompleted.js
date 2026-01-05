exports.isCompleted = async (req, res, next) => {
  try {
    if (!req.enrollment.progress === 100) {
      return res
        .status(404)
        .json({ message: "You Should Complete Course To Rate it" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
