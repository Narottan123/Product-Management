const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product_Project5",
        },

        quantity: { type: Number, required: true, minLen: 1 },
      },
    ],
    totalPrice: {
      type: Number,
    },
    totalItems: {
      type: Number,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Cart_Project5", cartSchema);
