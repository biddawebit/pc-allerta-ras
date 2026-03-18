import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/run", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ success: false, error: "Missing ?url=" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
    });

    const page = await browser.newPage();

    await page.goto(targetUrl, { waitUntil: "networkidle0" });

    await page.waitForFunction(() => window.__OUTPUT__ !== undefined, {
      timeout: 60000
    });

    const result = await page.evaluate(() => window.__OUTPUT__);

    await browser.close();

    res.json({ success: true, data: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
