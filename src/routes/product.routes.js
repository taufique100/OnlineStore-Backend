import { Router } from "express";
import { addProduct, getAllProduct, getProductById } from "../controllers/product.controller.js";

const router = Router();

router.route('/addProduct').post(addProduct)
router.route('/getProductById/:id').get(getProductById)
router.route('/getAllProduct').get(getAllProduct)

export default router