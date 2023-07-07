const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontroller");
const productController = require("../controllers/productcontroller");
const cartController = require("../controllers/cartcontroller");
const orderController = require("../controllers/ordercontroller");
const usermiddleware = require("../middlewares/userregister");
const tokenverify = require("../middlewares/tokenVerify");
const validateProduct = require("../middlewares/validateProduct");
//Register
router.get(
  "/register",
  usermiddleware.registerValidation,
  userController.userRegister
);
router.post("/upload", userController.createAws);
//Login
router.post("/login", userController.userLogin);
//get user details
router.get(
  "/user/:userId/profile",
  tokenverify.tokenVerify,
  userController.userdetails
);
//update user details
router.put(
  "/user/:userId/profile",
  tokenverify.tokenVerify,
  userController.Updateuserdetails
);
//create product
router.post(
  "/products",
  validateProduct.validateProduct,
  productController.createProduct
);
//get product
router.get("/products", productController.getProduct);
//update Product
router.put("/products/:productId", productController.updateProduct);
//delete Product
router.delete("/products/:productId", productController.deleteProduct);
//create Cart
router.post(
  "/users/:userId/cart",
  tokenverify.tokenVerify,
  cartController.addToCart
);
router.put(
  "/users/:userId/cart",
  tokenverify.tokenVerify,
  cartController.updateCart
);
//get cart summary
router.get(
  "/users/:userId/cart",
  tokenverify.tokenVerify,
  cartController.getCartSummary
);
//delete cart
router.delete(
  "/users/:userId/cart",
  tokenverify.tokenVerify,
  cartController.deleteCart
);
//create order
router.post(
  "/users/:userId/orders",
  tokenverify.tokenVerify,
  orderController.createOrder
);
//update order status
router.put(
  "/users/:userId/orders",
  tokenverify.tokenVerify,
  orderController.updateOrderStatus
);
module.exports = router;
