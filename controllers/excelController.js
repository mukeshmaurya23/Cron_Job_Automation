const xlsx = require("xlsx");
const multer = require("multer");
// const excelController = (req, res) => {
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
const excelController = (req, res) => {
  const workbook = xlsx.readFile(__dirname + "/public/" + req.file.filename);
  let workbook_sheet = workbook.SheetNames;
  let workbook_response = xlsx.utils.sheet_to_json(
    workbook.Sheets[workbook_sheet[0]]
  );
  //also log the response in console
  console.log(workbook_response);
  res.status(200).send({
    message: workbook_response,
  });
};
module.exports = excelController;
