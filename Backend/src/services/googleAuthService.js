const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return {
      name: payload.name,
      email: payload.email,
      profileImage: payload.picture,
      googleId: payload.sub,
    };
  } catch (error) {
    console.error("Google Token Verification Failed:", error.message);
    throw new Error("Invalid or Expired Google Token");
  }
};
