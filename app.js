const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgon = require("morgan");
const connectionDB = require("./lib/connectionDB");
const multer = require("multer");
var cron = require("node-cron");
const xlsx = require("xlsx");
// const ExcelDataModel = require("./models/ExcelDataModal");
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
connectionDB();
//check logs in console
app.use(morgon("dev"));
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// app.post("/upload", upload.single("file"), async (req, res) => {
//   console.log(req.file);
//   const workbook = xlsx.readFile(__dirname + "/public/" + req.file.filename);
//   let workbook_sheet = workbook.SheetNames;
//   let workbook_response = xlsx.utils.sheet_to_json(
//     workbook.Sheets[workbook_sheet[0]]
//   );
//   //also log the response in console

//   workbook_response = workbook_response.map((item) => {
//     // Remove extra spaces and characters from keys
//     const normalizedItem = {};
//     Object.keys(item).forEach((key) => {
//       const normalizedKey = key.trim().replace(/[^a-zA-Z0-9]/g, "");
//       normalizedItem[normalizedKey] = item[key];
//     });
//     return normalizedItem;
//   });

//   // Log the normalized response in the console
//   console.log("Normalized Response:", workbook_response);

//   await ExcelDataModel.create(workbook_response);

//   res.status(200).json({
//     message: "File uploaded successfully",
//     file: req.file,
//   });
// });
const mongoose = require("mongoose");

const RecordMetadata = mongoose.model("RecordMetadata", {
  lastProcessedIndex: Number,
});
//run ecevry 20 minutes
cron.schedule("*/20 * * * *", async () => {
  console.log("running a task every minute");
  const categoryModels = {};

  try {
    const metadata = await RecordMetadata.findOne();
    const lastProcessedIndex = metadata ? metadata.lastProcessedIndex || 0 : 0;

    const workbook = xlsx.readFile(
      __dirname + "/public/" + "InsuranceData.xlsx"
    );
    const workbook_sheet = workbook.SheetNames;
    const workbook_response = xlsx.utils.sheet_to_json(
      workbook.Sheets[workbook_sheet[0]]
    );

    const recordsToSave = workbook_response.slice(
      lastProcessedIndex,
      lastProcessedIndex + 20
    );

    if (recordsToSave.length > 0) {
      const uniqueCategories = [
        ...new Set(recordsToSave.map((item) => item.Category)),
      ];

      for (const category of uniqueCategories) {
        if (!categoryModels[category]) {
          categoryModels[category] =
            mongoose.models[category] ||
            mongoose.model(
              category,
              new mongoose.Schema({}, { strict: false })
            );
        }

        const CategoryModel = categoryModels[category];
        console.log(CategoryModel, "CategoryModel");

        const categoryRecords = recordsToSave.filter(
          (item) => item.Category === category
        );
        console.log(categoryRecords, "categoryRecords");

        await CategoryModel.create(categoryRecords);
      }

      // Update the last processed index
      await RecordMetadata.updateOne(
        {},
        { lastProcessedIndex: lastProcessedIndex + 20 },
        { upsert: true }
      );

      console.log(`Total records saved: ${recordsToSave.length}`);
    } else {
      console.log("No new records to save.");
    }
  } catch (error) {
    console.error("Error during cron job:", error);
  }
});

// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     console.log(req.file);
//     const workbook = xlsx.readFile(__dirname + "/public/" + req.file.filename);
//     let workbook_sheet = workbook.SheetNames;
//     let workbook_response = xlsx.utils.sheet_to_json(
//       workbook.Sheets[workbook_sheet[0]]
//     );

//     // Log the original response in the console
//     console.log("Original Response:", workbook_response);

//     // Normalize the keys in each object in the array
//     workbook_response = workbook_response.map((item) => {
//       const normalizedItem = {};
//       Object.keys(item).forEach((key) => {
//         const normalizedKey = key.trim().replace(/[^a-zA-Z0-9]/g, "");
//         normalizedItem[normalizedKey] = item[key];
//       });
//       return normalizedItem;
//     });

//     // Log the normalized response in the console
//     console.log("Normalized Response:", workbook_response);

//     // Find the last saved policy number
//     const lastSavedRecord = await ExcelDataModel.findOne(
//       {},
//       {},
//       { sort: { Policy: -1 } }
//     );

//     // Determine the skip value based on the total records saved
//     const skip = totalRecordsSaved;

//     // Save only the next 20 records to the database
//     await ExcelDataModel.create(workbook_response.slice(skip, skip + 20));

//     // Update the count of total records saved
//     totalRecordsSaved += 20;

//     // Send the response back to the client
//     res.status(200).json({
//       message: `Data saved successfully. Total records saved: ${totalRecordsSaved}`,
//       file: req.file,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.get("/file", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
