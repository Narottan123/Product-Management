const usermodel = require("../models/usermodel");
const registerValidation = async (req, res, next) => {
  try {
    let { fname, lname, email, phone, password, address } = req.body;
    if (!fname) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide first name" });
    }
    if (!lname) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide last name" });
    }
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide email address" });
    }
    email = email.toLowerCase();
    let emailexist = await usermodel.findOne({ email: email });
    //409 status code used for conflict
    if (emailexist) {
      return res
        .status(409)
        .json({ status: false, message: "email id should be unique" });
    }
    const emailRegex =
      /^[a-zA-Z][a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: false, message: "email id format is invalid " });
    }

    //mobile number validation check
    if (!phone) {
      return res.status(400).send({
        status: false,
        message: "Please provide mobile number",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ status: false, message: "Mobile number should be 10 digits" });
    }
    let mobileNumber = await usermodel.findOne({ phone: phone });
    if (mobileNumber) {
      return res
        .status(409)
        .json({ status: false, message: "Mobile number should be unique" });
    }
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide password" });
    }

    if (password.length < 6 || password.length > 15) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide strong password" });
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[@_#$&%?]/.test(password)
    ) {
      return res.status(400).json({
        status: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.",
      });
    }
    if (!address) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide address" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
module.exports = { registerValidation };
