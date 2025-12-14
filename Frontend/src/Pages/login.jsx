import * as React from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { GoogleLogin } from "@react-oauth/google";
import { styled } from "@mui/material/styles";
import ForgotPassword from "./ForgotPassword";
import AppTheme from "../components/helpers/shared-theme/AppTheme";
import { useNavigate } from "react-router-dom";
import { SitemarkIcon } from "../components/helpers/shared-theme/CustomIcons";
import { useToast } from "../components/ui/toast/ToastContext";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: { maxWidth: "450px" },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
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

export default function Login(props) {
  const navigate = useNavigate();
  const toast = useToast();

  React.useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [openForgotPassword, setOpenForgotPassword] = React.useState(false);
  const [openVerifyEmail, setOpenVerifyEmail] = React.useState(false);
  const [verifyEmail, setVerifyEmail] = React.useState("");
  const [verifyEmailError, setVerifyEmailError] = React.useState("");
  const [showUnverifiedAlert, setShowUnverifiedAlert] = React.useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState("");
  const [showSuccessSnackbar, setShowSuccessSnackbar] = React.useState(false);

  const handleClickOpenForgotPassword = () => setOpenForgotPassword(true);
  const handleCloseForgotPassword = () => setOpenForgotPassword(false);

  const handleClickOpenVerifyEmail = () => setOpenVerifyEmail(true);
  const handleCloseVerifyEmail = () => {
    setOpenVerifyEmail(false);
    setVerifyEmail("");
    setVerifyEmailError("");
  };

  const validateInputs = () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
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

    return isValid;
  };

  // دالة للتوجيه حسب دور المستخدم
  const redirectUserByRole = (userRole) => {
    if (userRole === "admin") {
      window.location.replace("/admin");
    } else {
      // user أو instructor
      window.location.replace("/");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    try {
      const res = await axios.post("http://localhost:5000/api/v1/users/login", {
        email,
        password,
      });

      if (!res.data.user.emailVerified) {
        setUnverifiedEmail(email);
        setShowUnverifiedAlert(true);
        return;
      }

      localStorage.setItem("token", res.data.token);

      setShowSuccessSnackbar(true);
      setTimeout(() => {
        redirectUserByRole(res.data.user.role); // استخدام الـ role من الـ response
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleVerifyEmailSubmit = async () => {
    if (!verifyEmail || !/\S+@\S+\.\S+/.test(verifyEmail)) {
      setVerifyEmailError("Please enter a valid email address.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/v1/users/resend-verification",
        { email: verifyEmail }
      );

      handleCloseVerifyEmail();
      toast.success("Verification code sent! Check your email.");
      window.location.href = `/verify-email?email=${verifyEmail}`;
    } catch (err) {
      setVerifyEmailError(
        err.response?.data?.message || "Email not found or already verified"
      );
    }
  };

  const handleGoToVerification = () => {
    window.location.href = `/verify-email?email=${unverifiedEmail}`;
  };

  // Google Sign In Success
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/users/google",
        { token: idToken }
      );
      localStorage.setItem("token", res.data.token);
      setShowSuccessSnackbar(true);
      setTimeout(() => {
        redirectUserByRole(res.data.user.role); // استخدام الـ role من الـ response
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Google Login failed");
    }
  };

  // Google Sign In Fail
  const handleGoogleLoginFailure = () => {
    alert("Google Login Failed. Please try again.");
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <SignInContainer
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
            Sign in
          </Typography>

          {showUnverifiedAlert && (
            <Alert
              severity="warning"
              onClose={() => setShowUnverifiedAlert(false)}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleGoToVerification}
                >
                  Verify Now
                </Button>
              }
            >
              Your account is not verified. Please verify your email.
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                autoFocus
                required
                fullWidth
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                type="password"
                id="password"
                required
                fullWidth
              />
            </FormControl>

            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />

            <Button type="submit" fullWidth variant="contained">
              Sign in
            </Button>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Link
                component="button"
                type="button"
                onClick={handleClickOpenForgotPassword}
                variant="body2"
              >
                Forgot your password?
              </Link>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                •
              </Typography>

              <Link
                component="button"
                type="button"
                onClick={handleClickOpenVerifyEmail}
                variant="body2"
              >
                Verify Email
              </Link>
            </Box>
          </Box>

          <ForgotPassword
            open={openForgotPassword}
            handleClose={handleCloseForgotPassword}
          />

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
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              width="100%"
              theme="filled_blue"
              text="signin_with"
              locale="en"
            />
            <Typography sx={{ textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" variant="body2">
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>

      <Dialog
        open={openVerifyEmail}
        onClose={handleCloseVerifyEmail}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            handleVerifyEmailSubmit();
          },
        }}
      >
        <DialogTitle>Verify Your Email</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <DialogContentText>
            Enter your email address and we&apos;ll send a verification code.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="verify-email"
            label="Email Address"
            type="email"
            fullWidth
            value={verifyEmail}
            onChange={(e) => {
              setVerifyEmail(e.target.value);
              setVerifyEmailError("");
            }}
            error={!!verifyEmailError}
            helperText={verifyEmailError}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={handleCloseVerifyEmail}>Cancel</Button>
          <Button variant="contained" type="submit">
            Send Code
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccessSnackbar}
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
        autoHideDuration={1200}
        onClose={() => setShowSuccessSnackbar(false)}
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
          You have logged in successfully!
        </Alert>
      </Snackbar>
    </AppTheme>
  );
}
