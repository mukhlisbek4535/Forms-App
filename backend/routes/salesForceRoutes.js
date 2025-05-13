import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Route: Push user info to Salesforce (Account + Contact)
router.post("/salesforce/push", async (req, res) => {
  const { company, firstName, lastName, email, phone } = req.body;

  // ✅ Access token and instance URL are now hardcoded from .env
  const accessToken = process.env.SALESFORCE_ACCESS_TOKEN;
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL;

  // ✅ Check required fields
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
    // ✅ Step 1: Create Account
    const accountRes = await axios.post(
      `${instanceUrl}/services/data/v59.0/sobjects/Account`,
      { Name: company },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const accountId = accountRes.data.id;

    // ✅ Step 2: Create Contact linked to the Account
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
      message: "✅ Account and Contact created successfully!",
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

export default router;
