const productmodel = require("../models/productmodel");
const validateProduct = async (req, res, next) => {
  const {
    title,
    description,
    price,
    currencyId,
    currencyFormat,
    productImage,
    availableSizes,
  } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Invalid title",
      data: null,
    });
  }
  const products = await productmodel.findOne({ title: title });
  if (products) {
    return res
      .status(400)
      .send({ status: false, message: "Title should be unique" });
  }

  if (!description || typeof description !== "string") {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Invalid description",
      data: null,
    });
  }

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Invalid price",
      data: null,
    });
  }

  if (currencyId !== "INR" || currencyFormat !== "₹") {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Invalid currency",
      data: null,
    });
  }

  if (!Array.isArray(availableSizes) || availableSizes.length === 0) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Invalid available sizes",
      data: null,
    });
  }

  const validSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
  const invalidSizes = availableSizes.filter(
    (size) => !validSizes.includes(size)
  );
  if (invalidSizes.length > 0) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: `Invalid sizes: ${invalidSizes.join(", ")}`,
      data: null,
    });
  }

  // If all validations pass, proceed to the next middleware or route handler
  next();
};
module.exports = { validateProduct };
