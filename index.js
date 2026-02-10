const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL?.trim();

console.log("Loaded EMAIL:", EMAIL);
console.log("Gemini Key:", process.env.GEMINI_API_KEY);


const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL,
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || Object.keys(body).length !== 1) {
      return res.status(400).json({
        is_success: false,
      });
    }

    const key = Object.keys(body)[0];
    const value = body[key];
    let data;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(value) || value < 0)
          throw "Invalid Fibonacci input";

        data = [];
        let a = 0, b = 1;
        for (let i = 0; i < value; i++) {
          data.push(a);
          [a, b] = [b, a + b];
        }
        break;

      case "prime":
        if (!Array.isArray(value)) throw "Invalid Prime input";
        data = value.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(value)) throw "Invalid LCM input";
        data = value.reduce((acc, num) => lcm(acc, num));
        break;

      case "hcf":
        if (!Array.isArray(value)) throw "Invalid HCF input";
        data = value.reduce((acc, num) => gcd(acc, num));
        break;

   case "AI":
  if (typeof value !== "string") throw "Invalid AI input";

  try {
     const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: value }] }]
    });

    data = response.data.candidates[0].content.parts[0].text
      .trim()
      .split(/\s+/)[0]
      .replace(/[.,]/g, "");

  } catch (error) {
    if (error.response?.status === 429) {
       // Specifically handle the rate limit error
       console.error("QUOTA EXCEEDED: Slow down your requests.");
       return res.status(429).json({ 
         is_success: false, 
         message: "Rate limit reached. Please wait a minute and try again." 
       });
    }
    console.error("AI Error:", error.response?.data || error.message);
    throw "AI failed";
  }
  break;


      default:
        throw "Invalid key";
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data,
    });

  }  catch (error) {
  console.log(error.response?.data || error.message);
  res.status(400).json({
    is_success: false,
  });
  console.log(error.response?.data || error.message);

}
});


module.exports = app;

