
const express = require("express");
const router = express.Router();

const {
  createServiceCategory,
  getAllServiceCategories,
  updateServiceCategory,
  toggleCategoryVisibility,
  updateSubService,
  toggleSubServiceVisibility,
  deleteServiceCategory,
  deleteSubService,
} = require("../controllers/serviceCategory.controller");

const { auth, isAdmin } = require("../middleware/auth");


router.use(auth, isAdmin);

router.post("/", createServiceCategory);
router.get("/", getAllServiceCategories);

router.patch("/:categoryId", updateServiceCategory);
router.patch("/:categoryId/visibility", toggleCategoryVisibility);

router.post("/:categoryId/sub-services", updateSubService);
router.patch(
  "/:categoryId/sub-services/:subServiceId/visibility",
  toggleSubServiceVisibility
);

router.delete("/:categoryId", deleteServiceCategory);
router.delete(
  "/:categoryId/sub-services/:subServiceId",
  deleteSubService
);

module.exports = router;
