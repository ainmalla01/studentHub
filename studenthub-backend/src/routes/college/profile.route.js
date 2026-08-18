import express from "express";
import {getMyProfile,updateUserProfile,updateProfileImg,getProfileById} from "../../controller/college/profile.controller.js"
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.middleware.js";
import { protect } from "../middleware/protected.middleware.js";
import { loadstudent } from "../middleware/loadstudent.middleware.js";




const router = express.Router();

router.get('/profile/me',protect,getMyProfile)
router.get('/profile/:id',getProfileById)
router.put('/profile/me', protect, updateUserProfile)
router.post("/profile/me/skills", protect,loadstudent, addSkill)
router.put("/profile/me/skills/:id", protect,loadstudent, updateSkill)
router.delete("/profile/me/skills/:id", protect,loadstudent, deleteSkill)
router.put("/profile/me/avatar",protect,upload.single("image"),updateProfileImg);


export default router;
