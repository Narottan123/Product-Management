const AWS = require("aws-sdk");

AWS.config.update({
  secretAccessKey: "jhElexsbG2OPx5p9Y39OxtOUE0Glp3ymDOxPcsBd",
  accessKeyId: "AKIA5NZLMZVFA4FDSAPN",
  region: "ap-south-1",
});

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    let s3 = new AWS.S3({
      apiVersion: "2006-03-01",
    });

    var uploadParams = {
      //ACL: "public-read",
      Bucket: "narottam",
      Key: "abc/" + file.originalname,
      Body: file.buffer,
    };

    s3.upload(uploadParams, function (error, data) {
      if (error) {
        return reject({ error: error });
      }
      console.log(data);
      console.log("File uploaded successfully");
      return resolve(data.Location);
    });
  });
};

module.exports = { uploadFile };
