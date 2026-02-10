const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const { GoogleGenerativeAI } = require("@google/generative-ai");


const EMAIL = process.env.OFFICIAL_EMAIL?.trim();

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
          throw new Error("Invalid Fibonacci input");

        data = [];
        let a = 0, b = 1;
        for (let i = 0; i < value; i++) {
          data.push(a);
          [a, b] = [b, a + b];
        }
        break;

      case "prime":
        if (!Array.isArray(value) || !value.every(Number.isInteger))
          throw new Error("Invalid Prime input");

        data = value.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(value) || !value.every(Number.isInteger))
          throw new Error("Invalid LCM input");

        data = value.reduce((acc, num) => lcm(acc, num));
        break;

      case "hcf":
        if (!Array.isArray(value) || !value.every(Number.isInteger))
          throw new Error("Invalid HCF input");

        data = value.reduce((acc, num) => gcd(acc, num));
        break;

      case "AI":
  const { GoogleGenerativeAI } = require("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  });

  const result = await model.generateContent(value);
  const text = result.response.text();

  data = text.trim().split(/\s+/)[0].replace(/[.,]/g, "");
  break;






      default:
        throw new Error("Invalid key");
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data,
    });

  } catch (error) {
  console.log(error.response?.data || error.message);

  
  if (error.response?.status === 429) {
    return res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: "Unavailable"
    });
  }

  res.status(400).json({
    is_success: false,
  });
}

module.exports = app;
