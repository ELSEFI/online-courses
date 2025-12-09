import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  Stack,
} from "@mui/material";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const email = params.get("email");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Code must be 6 digits.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/v1/users/verify-email", {
        email,
        code,
      });

      alert("Email verified successfully!");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: "100vh", padding: 2 }}
    >
      <Card sx={{ width: 350, padding: 3 }}>
        <Typography variant="h5" textAlign="center" mb={2}>
          Verify Your Email
        </Typography>

        <Typography sx={{ mb: 1 }}>
          Email: <strong>{email}</strong>
        </Typography>

        <TextField
          label="Verification Code"
          inputProps={{ maxLength: 6 }}
          value={code}
          onChange={(e) => {
            setError("");
            setCode(e.target.value.replace(/\D/g, "")); // digits only
          }}
          fullWidth
        />

        {error && (
          <Typography color="error" mt={1}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleVerify}
        >
          Verify Email
        </Button>
      </Card>
    </Stack>
  );
}
