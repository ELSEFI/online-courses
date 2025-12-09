import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import axios from "axios";

export default function ForgotPassword({ open, handleClose }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // مهم جدًا يمنع default submit للـ login form
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/users/forgot-password",
        { email }
      );
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <Box
        component="form"
        onSubmit={handleSubmit} // الفورم مستقل
        sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}
      >
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email and we will send you a password reset link.
          </DialogContentText>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Send Link
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
