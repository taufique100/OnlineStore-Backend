import { Router } from "express";
import { getAllUser, getDeleteUser, getUserDeatils, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserById } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)
//secured routes
router.route('/logout').post(verifyWT ,logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/getUser').get(getUserDeatils)
router.route('/updateUserById/:id').patch(updateUserById)
router.route('/getAllUsers').get(getAllUser)
router.route('/deleterUser/:id').delete(getDeleteUser)

export default router