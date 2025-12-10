import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { styled } from "@mui/material/styles";

const ErrorContainer = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0a0e27",
  position: "relative",
  overflow: "hidden",
});

// خلفية متحركة بالنجوم
const StarsBackground = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 60px 70px, #fff, transparent),
    radial-gradient(1px 1px at 50px 50px, #ddd, transparent),
    radial-gradient(1px 1px at 130px 80px, #fff, transparent),
    radial-gradient(2px 2px at 90px 10px, #fff, transparent)
  `,
  backgroundSize: "200px 200px",
  animation: "stars 20s linear infinite",
  "@keyframes stars": {
    "0%": {
      transform: "translateY(0)",
    },
    "100%": {
      transform: "translateY(-200px)",
    },
  },
});

// دائرة متوهجة في الخلفية
const GlowCircle = styled(Box)({
  position: "absolute",
  width: "500px",
  height: "500px",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(138, 43, 226, 0.15) 0%, transparent 70%)",
  filter: "blur(60px)",
  animation: "pulse 4s ease-in-out infinite",
  "@keyframes pulse": {
    "0%, 100%": {
      opacity: 0.5,
      transform: "scale(1)",
    },
    "50%": {
      opacity: 0.8,
      transform: "scale(1.1)",
    },
  },
});

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <ErrorContainer>
      {/* خلفية النجوم */}
      <StarsBackground />

      {/* دوائر متوهجة */}
      <GlowCircle sx={{ top: "-250px", left: "-250px" }} />
      <GlowCircle sx={{ bottom: "-250px", right: "-250px" }} />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ textAlign: "center" }}>
          {/* رقم 404 الكبير */}
          <Typography
            sx={{
              fontSize: { xs: "8rem", md: "15rem" },
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 0.8,
              mb: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 80px rgba(102, 126, 234, 0.5)",
              animation: "glow 2s ease-in-out infinite alternate",
              "@keyframes glow": {
                "0%": {
                  filter:
                    "brightness(1) drop-shadow(0 0 20px rgba(102, 126, 234, 0.5))",
                },
                "100%": {
                  filter:
                    "brightness(1.2) drop-shadow(0 0 40px rgba(102, 126, 234, 0.8))",
                },
              },
            }}
          >
            404
          </Typography>

          {/* العنوان */}
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: "1.8rem", md: "3rem" },
              fontWeight: 700,
              mb: 2,
              color: "#fff",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            Lost in the Digital Void
          </Typography>

          {/* الوصف */}
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1rem", md: "1.3rem" },
              mb: 5,
              color: "rgba(255,255,255,0.7)",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            The page you're searching for has vanished into the darkness. Let's
            guide you back to safety.
          </Typography>

          {/* الأزرار */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
              sx={{
                bgcolor: "#667eea",
                color: "white",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "12px",
                textTransform: "none",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  bgcolor: "#764ba2",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(102, 126, 234, 0.6)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Back to Home
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "white",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "12px",
                textTransform: "none",
                borderWidth: "2px",
                "&:hover": {
                  borderColor: "#667eea",
                  bgcolor: "rgba(102, 126, 234, 0.1)",
                  transform: "translateY(-2px)",
                  borderWidth: "2px",
                },
                transition: "all 0.3s ease",
              }}
            >
              Go Back
            </Button>
          </Box>

          {/* رسمة توضيحية */}
          <Box
            sx={{
              mt: 8,
              display: "flex",
              justifyContent: "center",
              opacity: 0.6,
            }}
          >
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* كوكب */}
              <circle
                cx="100"
                cy="100"
                r="60"
                fill="url(#planetGradient)"
                opacity="0.8"
              />

              {/* حلقة الكوكب */}
              <ellipse
                cx="100"
                cy="100"
                rx="90"
                ry="20"
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth="4"
                opacity="0.6"
              />

              {/* نجوم صغيرة */}
              <circle cx="40" cy="40" r="2" fill="#fff" opacity="0.8" />
              <circle cx="160" cy="50" r="2" fill="#fff" opacity="0.6" />
              <circle cx="30" cy="150" r="2" fill="#fff" opacity="0.7" />
              <circle cx="170" cy="140" r="2" fill="#fff" opacity="0.9" />

              {/* Gradients */}
              <defs>
                <linearGradient
                  id="planetGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
                <linearGradient
                  id="ringGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#667eea" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#764ba2" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#667eea" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </Box>
        </Box>
      </Container>
    </ErrorContainer>
  );
};

export default NotFound;
