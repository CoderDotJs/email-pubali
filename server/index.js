import express from "express";
import nodemailer from "nodemailer";
import fileUpload from "express-fileupload";
import cors from "cors";
import User from "./User.model.js";
import mongoose from "mongoose";
import config from "./config.js";
import { read, utils } from "xlsx";
import Stats from "./Stats.model.js";
import inlineBase64 from "nodemailer-plugin-inline-base64";
import moment from "moment";
import path from "path";
import fs from "fs";
import multer from "multer";
const __dirname = path.resolve();
// Ensure the 'uploads' directory exists, create it if not
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Created uploads directory");
}

const app = express();
// app.use(fileUpload());
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file);
    cb(null, "uploads/"); // specify the upload directory
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname); // specify the file name
  },
});

const upload = multer({ storage: storage });

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.post("/upload", upload.single("excel"), (req, res) => {
  return res.json({ message: "File uploaded successfully" });
});

// Endpoint to get the list of uploaded files
app.get("/files", (req, res) => {
  if (fs.existsSync(uploadDir)) {
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error reading the upload directory" });
      }
      res.json({ files });
    });
  } else {
    fs.mkdirSync(uploadDir);
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error reading the upload directory" });
      }
      res.json({ files });
    });
  }
});

// Endpoint to read a single file
app.get("/file/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    try {
      const workbook = xlsx.readFile(filePath);
      // Assuming you have only one sheet in the Excel file
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // Parse sheet data into JSON format
      const jsonData = utils.sheet_to_json(sheet, { header: 1 });
      const emailArr = jsonData
        .slice(1, jsonData.length)
        .filter((l) => l.length == 2); //Output: [['Akash', 'md.akash@6724@gmail.com'], ...rest]

      res.json({ data: emailArr });
    } catch (error) {
      res.status(500).json({ error: "Error reading the XLSX file" });
    }
  } else {
    res.status(404).json({ error: "XLSX file not found" });
  }
});

// Endpoint to download a single file
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    try {
      // Set Content-Disposition header to prompt download
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ error: "Error reading the file" });
    }
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Endpoint to delete a single file
app.delete("/file/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting the file" });
    }
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

app.post("/bulk-email", fileUpload(), async (req, res) => {
  try {
    const excel = req.files.excel;
    if (!excel || !req.body.data) {
      return res.status(400).json({ message: "Excel not provided!" });
    }
    const { subject, email, emailBody } = JSON.parse(req.body.data);
    const workbook = read(excel.data, { type: "buffer" });

    // Assuming you have only one sheet in the Excel file
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Parse sheet data into JSON format
    const jsonData = utils.sheet_to_json(sheet, { header: 1 });
    const emailArr = jsonData
      .slice(1, jsonData.length)
      .filter((l) => l.length == 2); //Output: [['Akash', 'md.akash@6724@gmail.com'], ...rest]
    res.status(200).json({ message: "Sent!" });
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com.",
      port: 465,
      secure: true,
      auth: {
        user: config.smtp_email,
        pass: config.smpt_pass,
      },
    });

    let totalSuccess = 0;
    let totalFails = 0;

    try {
      for (let i = 0; i < emailArr.length; i++) {
        transporter.use("compile", inlineBase64({ cidPrefix: "pubali_" }));
        await transporter
          .sendMail({
            from: "PUBALI BANK " + email, // sender address
            to: emailArr[i][0] + " " + emailArr[i][1],
            subject: subject, // Subject line
            // text: text, // plain text body
            html: emailBody, // html body
          })
          .then(() => {
            totalSuccess++;
          })
          .catch((err) => {
            totalFails++;
            console.log(err);
          });
      }
    } finally {
      const stats = [];
      if (totalSuccess !== 0) {
        stats.push({ count: totalSuccess, isSuccess: true });
      }
      if (totalFails !== 0) {
        stats.push({ count: totalFails, isSuccess: false });
      }
      await Stats.insertMany(stats).then((data) => {
        console.log(data);
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new user and save it to the database
    const newUser = await User.create({ email, password });

    res.status(200).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Not found!" });
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: "Wrong password!",
      });
    }

    res.status(200).json({ user, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//stats
app.get("/stats", async (req, res) => {
  try {
    const sevenDaysAgo = moment().subtract(7, "days").startOf("day");

    const aggregatedStats = await Stats.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo.toDate() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          successCount: {
            $sum: { $cond: [{ $eq: ["$isSuccess", true] }, 1, 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$isSuccess", false] }, 1, 0] },
          },
        },
      },
    ]);

    const labels = [];
    const successData = [];
    const failedData = [];

    aggregatedStats.forEach((stat) => {
      labels.push(stat._id);
      successData.push(stat.successCount);
      failedData.push(stat.failedCount);
    });

    const options = {
      series: [
        { name: "Success", data: successData },
        { name: "Failed", data: failedData },
      ],
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
          minHeight: 5,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: labels,
      },
      yaxis: {
        title: {
          text: "Count",
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "$ " + val + " thousands";
          },
        },
      },
    };

    res.json({
      success: true,
      data: options,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ data: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

mongoose
  .connect(config.db_url, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Mongodb Connected!");
    app.listen(config.port, () => {
      console.log(`App listening on port ${config.port}`);
    });
  });
