import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Route 1: Start OAuth flow
router.get("/salesforce/auth", (req, res) => {
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI;

  const authUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;

  // Redirect the user to Salesforce's login and authorization page
  return res.redirect(authUrl);
});

export default router;

// Route 2: Handle Salesforce OAuth callback
router.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Missing authorization code from Salesforce.");
  }

  try {
    const response = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          client_id: process.env.SALESFORCE_CLIENT_ID,
          client_secret: process.env.SALESFORCE_CLIENT_SECRET,
          redirect_uri: process.env.SALESFORCE_REDIRECT_URI,
        },
      }
    );
    console.log(response.data);
    const { access_token, instance_url, id } = response.data;

    // For now, just display this to verify everything works
    return res.status(200).json({
      message: "Salesforce authentication successful!",
      access_token,
      instance_url,
      user_id_url: id,
    });
  } catch (error) {
    console.error(
      "OAuth callback error:",
      error.response?.data || error.message
    );
    return res.status(500).send("Failed to exchange code for access token.");
  }
});
