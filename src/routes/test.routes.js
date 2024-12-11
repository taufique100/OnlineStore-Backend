import { Router } from "express";
import { getAllData } from "../controllers/test.controller.js";


const router = Router()

router.route('/getAllData').get(getAllData)


export default router