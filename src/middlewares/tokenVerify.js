const jwt = require("jsonwebtoken");

const tokenVerify = async (req, res, next) => {
  try {
    let token = req.headers["x-auth-token"];
    if (!token) {
      return res
        .status(404)
        .send({ status: false, message: "Token not found" });
    }

    jwt.verify(token, "Product123", async function (err, decoded) {
      if (err) {
        return res.status(401).send({ status: false, msg: "Invalid Token" });
      } else {
        req["x-auth-token"] = decoded;
        next();
      }
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports.tokenVerify = tokenVerify;
