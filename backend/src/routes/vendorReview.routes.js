const express = require("express");
const router = express.Router();

const {
  createVendorReview,
} = require("../controllers/vendorReview.controller");

const { auth, isCustomer } = require("../middleware/auth");

router.post("/", auth, isCustomer, createVendorReview);

module.exports = router;