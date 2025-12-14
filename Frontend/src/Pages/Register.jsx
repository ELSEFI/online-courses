import * as React from "react";
import axios from "axios";
import useAuthRedirect from "../hooks/useAuthRedirect";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { styled } from "@mui/material/styles";
import { useToast } from "../components/ui/toast/ToastContext";
import AppTheme from "../components/helpers/shared-theme/AppTheme";
import { SitemarkIcon } from "../components/helpers/shared-theme/CustomIcons";

// =============== Google ===============
import { GoogleLogin } from "@react-oauth/google";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function Register(props) {
  useAuthRedirect();
  const toast = useToast();

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showGoogleSuccess, setShowGoogleSuccess] = React.useState(false);

  // Google Signup Success
  const handleGoogleSignupSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/users/google",
        { token: idToken }
      );
      localStorage.setItem("token", res.data.token);
      setShowGoogleSuccess(true);
      setTimeout(() => {
        window.location.replace("/");
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.message || "Google Signup failed");
    }
  };
  // Google Signup Failed
  const handleGoogleSignupFailure = () => {
    toast.error("Google Signup Failed. Please try again.");
  };

  const handleRegister = async (name, email, password) => {
    try {
      await axios.post("http://localhost:5000/api/v1/users/register", {
        name,
        email,
        password,
      });

      setShowSuccess(true);
      setTimeout(() => {
        window.location.href = `/verify-email?email=${email}`;
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  const validateInputs = () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const name = document.getElementById("name");

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage("Name is required.");
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateInputs()) return;
    const data = new FormData(event.currentTarget);
    const name = data.get("name");
    const email = data.get("email");
    const password = data.get("password");
    handleRegister(name, email, password);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer
        direction="column"
        justifyContent="space-between"
        sx={{ position: "relative", zIndex: 10 }}
      >
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign up
          </Typography>

          {showSuccess && (
            <Alert severity="success">
              Account created! Check your email for verification code.
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                id="name"
                name="name"
                placeholder="Jon Snow"
                required
                fullWidth
                error={nameError}
                helperText={nameErrorMessage}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                name="email"
                placeholder="your@email.com"
                required
                fullWidth
                error={emailError}
                helperText={emailErrorMessage}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                name="password"
                placeholder="••••••"
                type="password"
                required
                fullWidth
                error={passwordError}
                helperText={passwordErrorMessage}
              />
            </FormControl>

            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" />}
              label="I want to receive updates via email."
            />

            <Button type="submit" fullWidth variant="contained">
              Sign up
            </Button>
          </Box>

          <Divider>or</Divider>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
            }}
          >
            <GoogleLogin
              onSuccess={handleGoogleSignupSuccess}
              onError={handleGoogleSignupFailure}
              width="100%"
              theme="filled_blue"
              text="signup_with"
              locale="en"
            />
            <Typography sx={{ textAlign: "center" }}>
              Already have an account? <Link href="/login">Sign in</Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
      {/* Google Signup Snackbar */}
      <Snackbar
        open={showGoogleSuccess}
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
        autoHideDuration={1200}
        onClose={() => setShowGoogleSuccess(false)}
        sx={{
          "& .MuiPaper-root": {
            minWidth: 320,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.1rem",
          },
        }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%", fontSize: "1rem", py: 2 }}
        >
          Welcome! You have signed up with Google successfully.
        </Alert>
      </Snackbar>
    </AppTheme>
  );
}
