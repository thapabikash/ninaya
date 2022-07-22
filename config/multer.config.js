const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./src/CSVfiles/");
    },
    filename: function (req, file, cb) {
        const filename = file.originalname.replace(/ /g, "_");
        cb(null, Date.now().toString() + "_" + filename);
    },
});

// const csvFilter = (req, file, cb) => {
//   if (file.mimetype.includes("csv")) {
//     cb(null, true);
//   } else {
//     cb("Please upload only csv file.", false);
//   }
// };

const upload = multer({
    storage: storage,
});

module.exports = upload;
