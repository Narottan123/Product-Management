const productModel = require("../models/productmodel");
const usermodel = require("../models/usermodel");
const cartModel = require("../models/cartmodel");
const ordermodel = require("../models/ordermodel");
const createOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const { cartId } = req.body;

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

    // Retrieve the cart details
    const cart = await cartModel.findOne({ _id: cartId, userId });
    if (!cart) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Cart not found",
        data: null,
      });
    }

    // Create the order document
    const order = new ordermodel({
      userId,
      items: cart.items,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalItems,
      totalQuantity: cart.items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
      cancellable: true,
      status: "pending",
    });

    // Save the order to the database
    await order.save();

    // Return the order document as the API response
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { orderId, status } = req.body;

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

    // Check if the order belongs to the user
    const order = await ordermodel.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Order not found",
        data: null,
      });
    }

    // Check if the order is cancellable
    if (!order.cancellable) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Order is not cancellable",
        data: null,
      });
    }

    // Update the order status
    order.status = status;
    await order.save();

    // Return the updated order document as the API response
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = { createOrder, updateOrderStatus };
