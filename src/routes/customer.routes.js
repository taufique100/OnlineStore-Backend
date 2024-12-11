import { Router } from "express";
import { addCustomer, getAllCustomer, getCustomerById } from "../controllers/customer.controller.js";

const router = Router();

router.route('/addCustomer').post(addCustomer)
router.route('/getAllCustomer').get(getAllCustomer)
router.route('/getCustomerById/:id').get(getCustomerById)

export default router