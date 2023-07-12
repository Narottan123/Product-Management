const { uploadFile } = require("../../Aws/awsconfig");
const productModel = require("../models/productmodel");
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
const createProduct = async (req, res) => {
  try {
    // Extract product data from request body
    const {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,

      style,
      availableSizes,
      installments,
    } = req.body;

    // Create a new product instance

    let savedData = await productModel.create({
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      productImage: uploadedFileURL,
      style,
      availableSizes,
      installments,
    });

    // Return the created product as the API response
    return res.status(201).json({
      status: "success",
      code: 201,
      message: "Product created successfully",
      data: savedData,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};
const getProduct = async (req, res) => {
  try {
    const { size, name, priceGreaterThan, priceLessThan, priceSort } =
      req.query;

    // Build the filter object based on the query parameters
    const filters = {};
    if (size) {
      filters.availableSizes = size;
    }
    if (name) {
      filters.title = { $regex: name, $options: "i" };
    }
    if (priceGreaterThan) {
      filters.price = { $gt: parseFloat(priceGreaterThan) };
    }
    if (priceLessThan) {
      filters.price = { ...filters.price, $lt: parseFloat(priceLessThan) };
    }

    // Find the products with the applied filters
    let query = productModel.find(filters);

    // Sort the products by price if priceSort is provided
    if (priceSort) {
      const sortValue = priceSort === "1" ? 1 : -1;
      query = query.sort({ price: sortValue });
    }

    // Execute the query and return the products
    const products = await query.exec();

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    // Check if the product exists and is not deleted
    const product = await productModel.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Product not found",
        data: null,
      });
    }

    // Return the updated product as the API response
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if the product exists and is not already deleted
    const product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Product not found",
        data: null,
      });
    }

    // Mark the product as deleted
    product.isDeleted = true;
    product.deletedAt = new Date();

    // Save the updated product to the database
    await product.save();

    // Return the success response
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Product deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  createAws,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
