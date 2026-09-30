const express = require("express");
const router = express.Router();

const {auth, isAdmin} = require('../middleware/auth')
// const { auth, isCustomer, isVendor, isAdmin } = require('../middleware/auth');

const {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deactivateInventory,
  deleteInventory,
  restockInventory,
  reduceInventoryStock,
  getLowStockInventory,
} = require("../controllers/inventory.controller");



router.post("/", auth, isAdmin, createInventory);

router.get("/", auth, isAdmin, getAllInventory);

router.get("/low-stock", auth, isAdmin, getLowStockInventory);

router.get("/:inventoryId", auth, isAdmin, getInventoryById);

router.put("/:inventoryId", auth, isAdmin, updateInventory);

router.patch(
  "/:inventoryId/deactivate",
  auth,
  isAdmin,
  deactivateInventory
);

router.delete("/:inventoryId", auth, isAdmin, deleteInventory);

router.patch("/:inventoryId/restock", auth, isAdmin, restockInventory);

router.patch(
  "/:inventoryId/reduce-stock",
  auth,
  isAdmin,
  reduceInventoryStock
);

module.exports = router;