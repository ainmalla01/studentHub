
import express from "express";

import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  userType_exists,
  studentRegister
} from "../controller/auth.controller.js";

import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/protected.middleware.js";

import {
  loginSchema,
  // studentRegisterSchema,
} from "../validations/auth.validation.js";
import { colloegepicUpload,getStudentProfile } from "../middleware/cloud.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { getCollegeInfo } from "../middleware/college.middleware.js";


const router = express.Router();


/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/

// checking college accout is register or not
// ✅ Correct Route Definition (No query parameters needed here!)
console.log("this is called")
console.log("Check handler type:", typeof userType_exists); 
router.get('/usertypes_exists', userType_exists);

// router.post(
//   "/register",
//   validate(registerSchema),
//   register
// );

router.post('/register',(req,res,next)=>{
  console.log("filepath one",req.file?.path)
  next();
}, upload.single('logo'), (req,res,next)=>{
  console.log("file path two",req.file?.path)
  next()
},colloegepicUpload, register);




router.post('/login',validate(loginSchema),(req, res, next)=>{
console.log("validate done")
next()
},login);

router.post(
  "/students/register/",(req,res,next)=>{console.log(req.body);
    next();
  },
protect,
getCollegeInfo,
getStudentProfile,
studentRegister
);
// validate(studentRegisterSchema),

// // Login student / college admin
// router.post(
//   "/login",
//   validate(loginSchema),
//   login
// );

// // Refresh access token
// router.post(
//   "/refresh-token",
//   refreshToken
// );

// /*
// |--------------------------------------------------------------------------
// | Protected Authentication Routes
// |--------------------------------------------------------------------------
// */

// // Logout authenticated user
// router.post(
//   "/logout",
//   protect,
//   logout
// );

// // Get currently authenticated user
// router.get(
//   "/me",
//   protect,
//   getMe
// );

export default router;

