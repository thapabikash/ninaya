// helper to manage data stored in s3

const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const config = require("../config");

const spacesEndpoint = new aws.Endpoint(config.awsEndpoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: config.awsAccessKey,
  secretAccessKey: config.awsSecretAccessKey,
});
async function s3Uploader(req, res, next) {
  let fileKey;
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: config.awsBucket,
      acl: "public-read",
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        console.log(file),"file";
        fileKey = `${Date.now()}-${file.originalname}`;
        cb(null, `uploads/${fileKey}`);
      },
    }),
  });
  const singleUpload = upload.single("profile_image");
  singleUpload(req, res, function (err, some) {
    if (err) {
      return res.status(422).send({
        errors: [{ title: "Image Upload Error", detail: err.message }],
      });
    }
    if (req.file) {
      req.file.filename = fileKey;
    }
    next();
  });
}

async function deleteObjS3(Key) {
  const params = {
    Bucket: config.awsBucket,
    Key,
  };
  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else console.log(data);
  });
}

module.exports = { s3Uploader, deleteObjS3 };
