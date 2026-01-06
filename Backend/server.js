require("dotenv").config();

const app = require("./app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// CONNECT DATABASE
connectDB();

// START SERVER
app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});
