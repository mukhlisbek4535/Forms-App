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
