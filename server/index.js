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

const app = express();
app.use(fileUpload());
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.post("/bulk-email", async (req, res) => {
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
