const { uploadFile } = require("../../Aws/awsconfig");
const usermodel = require("../models/usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
var uploadedFileURL = "";
const createAws = async (req, res) => {
  try {
    let files = req.files;
    if (files && files.length > 0) {
      uploadedFileURL = await uploadFile(files[0]);
      return res.status(201).send({
        status: true,
        message: "file uploaded successfully",
        data: uploadedFileURL,
      });
    } else {
      return res.status(400).send({ status: false, message: "No file found" });
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
const userRegister = async (req, res) => {
  let { fname, lname, email, phone, password, address } = req.body;
  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  password = hashedPassword;
  console.log(uploadedFileURL);
  let savedData = await usermodel.create({
    fname,
    lname,
    email,
    profileImage: uploadedFileURL,
    phone,
    password,
    address,
  });
  //let saveddata = await usermodel.create(data);
  return res
    .status(201)
    .send({ status: false, message: "Data send successfully", savedData });
};
const userLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide email address" });
    }
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide password" });
    }
    let userExist = await usermodel.findOne({
      email: email,
    });
    let hashPassword = userExist.password;
    let validPassword = await bcrypt.compare(password, hashPassword);
    if (!userExist && !validPassword) {
      return res
        .status(401)
        .json({ status: false, message: "userid and password is invalid" });
    }
    let token = jwt.sign(
      { project: "Product Management", userId: userExist._id },
      "Product123",
      { expiresIn: "1h" }
    );

    res.setHeader("x-auth-token", token);
    return res
      .status(201)
      .send({ status: true, data: { userId: userExist._id, token: token } });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
const userdetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the  by its ID
    const user = await usermodel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    id = user._id.toString();
    if (req["x-auth-token"].userId !== id) {
      return res
        .status(403)
        .send({ status: false, message: "Unauthorized Acees" });
    }

    // If no user is found, return a 404 response

    // Return the book details with the reviews array
    return res.status(200).json({
      status: true,
      data: "User profile details",
      user,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
const Updateuserdetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the  by its ID
    const user = await usermodel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    id = user._id.toString();
    if (req["x-auth-token"].userId !== id) {
      return res
        .status(403)
        .send({ status: false, message: "Unauthorized Acees" });
    }

    let { fname, lname, email, profileImage, phone, password, address } =
      req.body;
    user.fname = fname || user.fname;
    user.lname = lname || user.lname;
    user.email = email || user.email;
    user.profileImage = profileImage || user.profileImage;
    user.phone = phone || user.phone;
    user.password = password || user.password;
    user.address = address || user.address;
    let updatedData = await user.save();
    return res.status(200).json({
      status: true,
      message: "User updated Successfully",
      data: updatedData,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = {
  userRegister,
  createAws,
  userLogin,
  userdetails,
  Updateuserdetails,
};
