const productModel = require("../models/productmodel");
const usermodel = require("../models/usermodel");
const cartModel = require("../models/cartmodel");
const addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { cartId, productId } = req.body;

    // Ensure userId in params and in JWT token match
    if (userId !== req["x-auth-token"].userId) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: null,
      });
    }

    // Check if the user exists
    const user = await usermodel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
        data: null,
      });
    }

    // Check if the cart exists for the user, otherwise create a new cart
    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      cart = new cartModel({ userId });
    }

    // Ensure the cartId in the request body matches the actual cart
    if (cartId && cartId !== cart._id.toString()) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Invalid cart ID",
        data: null,
      });
    }

    // Check if the product exists and is not deleted
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

    // Check if the product is already in the cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );
    if (existingItem) {
      // If the product is already in the cart, increase the quantity by 1
      existingItem.quantity += 1;
    } else {
      // If the product is not in the cart, add it as a new item
      cart.items.push({ productId, quantity: 1 });
    }

    // Calculate totalPrice and totalItems based on the cart items
    cart.totalPrice = cart.items.reduce((total, item) => {
      const productPrice = item.quantity * product.price;
      return total + productPrice;
    }, 0);

    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Save the cart to the database
    await cart.save();

    // Include cart items and total price in the response
    const response = {
      userId: userId,
      cartId: cart._id,
      totalPrice: cart.totalPrice,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    // Return the response as the API response
    return res.status(201).json({
      status: "success",
      code: 201,
      message: "Product added to cart successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};
const updateCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { cartId, productId, removeProduct } = req.body;

    // Ensure userId in params and in JWT token match
    if (userId !== req["x-auth-token"].userId) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: null,
      });
    }

    // Check if the user exists
    const user = await usermodel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
        data: null,
      });
    }

    // Check if the cart exists for the user
    const cart = await cartModel.findOne({ _id: cartId, userId });
    if (!cart) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Cart not found",
        data: null,
      });
    }

    // Check if the product exists and is not deleted
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

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    // If the item is not found in the cart, return an error
    if (itemIndex === -1) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Product not found in the cart",
        data: null,
      });
    }

    // If removeProduct flag is true (1), remove the product from the cart
    if (removeProduct === 1) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Otherwise, decrement the quantity by 1
      const currentItem = cart.items[itemIndex];
      if (currentItem.quantity > 1) {
        currentItem.quantity -= 1;
      } else {
        cart.items.splice(itemIndex, 1);
      }
    }

    // Calculate totalPrice and totalItems based on the updated cart items
    cart.totalPrice = cart.items.reduce((total, item) => {
      const itemPrice = item.quantity * product.price;
      return total + itemPrice;
    }, 0);
    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Save the updated cart to the database
    await cart.save();

    // Return the updated cart document as the API response
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};
const getCartSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure userId in params and in JWT token match
    if (userId !== req["x-auth-token"].userId) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: null,
      });
    }

    // Check if the user exists
    const user = await usermodel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
        data: null,
      });
    }

    // Check if the cart exists for the user
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Cart not found",
        data: null,
      });
    }

    // Retrieve product details for the items in the cart
    const productIds = cart.items.map((item) => item.productId);
    const products = await productModel.find({ _id: { $in: productIds } });

    // Format the cart summary response
    const cartSummary = {
      cartId: cart._id,
      userId: cart.userId,
      items: cart.items.map((item) => {
        const product = products.find((product) =>
          product._id.equals(item.productId)
        );
        return {
          productId: item.productId,
          quantity: item.quantity,
          product: {
            _id: product._id,
            title: product.title,
            price: product.price,
            currencyId: product.currencyId,
            currencyFormat: product.currencyFormat,
            productImage: product.productImage,
          },
        };
      }),
      totalPrice: cart.totalPrice,
      totalItems: cart.totalItems,
    };

    // Return the cart summary as the API response
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Cart summary retrieved successfully",
      data: cartSummary,
    });
  } catch (error) {
    console.error("Error retrieving cart summary:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};
const deleteCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure userId in params and in JWT token match
    if (userId !== req["x-auth-token"].userId) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: null,
      });
    }

    // Check if the user exists
    const user = await usermodel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
        data: null,
      });
    }

    // Check if the cart exists for the user
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Cart not found",
        data: null,
      });
    }

    // Clear the cart by resetting the items array, totalItems, and totalPrice
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    // Save the updated cart to the database
    await cart.save();

    // Return a success response with HTTP status 204 (No Content)
    return res.status(204).json({
      status: "success",
      code: 204,
      message: "Cart deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting cart:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = { addToCart, updateCart, getCartSummary, deleteCart };
