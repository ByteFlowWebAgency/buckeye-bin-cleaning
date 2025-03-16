const path = require("path");

const fetch = require("node-fetch");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env.local") });

async function setAdmin(email) {
  if (!process.env.ADMIN_SECRET_KEY) {
    console.error("Error: ADMIN_SECRET_KEY is not defined in environment");
    return;
  }

  try {
    const response = await fetch(`${ process.env.DOMAIN_URL }/api/set-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        email, 
        secretKey: process.env.ADMIN_SECRET_KEY 
      }),
    });
    
    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

setAdmin("byteflowservices@gmail.com")
  .then(() => console.log("Done!"))
  .catch(err => console.error("Script error:", err));

setAdmin("buckeyebincleaning@gmail.com")
  .then(() => console.log("Done!"))
  .catch(err => console.error("Script error:", err));