import { Router } from "express";
import { createOrder, getOrderDetails } from "../controllers/order.controller.js";


const router = Router()

router.route('/createOrder').post(createOrder)
router.route('/getOrderDetails/:id').get(getOrderDetails)

export default router;