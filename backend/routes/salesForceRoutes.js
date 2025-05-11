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

    return res.redirect(
      `https://forms-app-theta.vercel.app/salesforce-success?access_token=${access_token}&instance_url=${instance_url}`
    );
  } catch (error) {
    console.error(
      "OAuth callback error:",
      error.response?.data || error.message
    );
    return res.status(500).send("Failed to exchange code for access token.");
  }
});

// Route 3: Push user info to Salesforce (Account + Contact)
router.post("/salesforce/push", async (req, res) => {
  const {
    accessToken,
    instanceUrl,
    company,
    firstName,
    lastName,
    email,
    phone,
  } = req.body;

  if (
    !accessToken ||
    !instanceUrl ||
    !company ||
    !firstName ||
    !lastName ||
    !email ||
    !phone
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Create Account
    const accountRes = await axios.post(
      `${instanceUrl}/services/data/v59.0/sobjects/Account`,
      {
        Name: company,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const accountId = accountRes.data.id;

    // 2. Create Contact linked to the Account
    const contactRes = await axios.post(
      `${instanceUrl}/services/data/v59.0/sobjects/Contact`,
      {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        AccountId: accountId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(201).json({
      message: "Account and Contact created successfully!",
      accountId,
      contactId: contactRes.data.id,
    });
  } catch (error) {
    console.error(
      "Salesforce push error:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Failed to push data to Salesforce" });
  }
});
