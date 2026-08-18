
import { asyncHandler } from "../../utils/asyncHandler.js"
import * as profileService from "../../services/profile.service.js"

import cloudinary from "../../config/cloudinary.js";


export const getMyProfile = asyncHandler(async (req, res) => {
  const userProfile = await profileService.getProfileById(req.user.id);

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: userProfile,
  });
});


export const getProfileById = asyncHandler(async (req, res) => {
   const profile = await profileService.getProfileById(req.params.id);
   res.status(200).json({
    success:true,
    message:"profile of user fetch successfully",
    data:profile
   })
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const updatedProfile = await profileService.updateProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedProfile,
  });
});

export const updateProfileImg = asyncHandler(async (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload an image",
    });
  }

  const result = await uploadCloud(req.file);

  const updatedProfile = await profileService.updateProfileImg(
    req.user.id,
    result.secure_url
  );

  res.status(200).json({
    success: true,
    message: "Profile image updated successfully",
    data: updatedProfile,
  });
});

export const addSkill = asyncHandler(async(req,res)=>{
const skillsAdded = await profileService.addSkill(req.student.id,req.body)
res.status(200).json({
  success:true,
  message:"profile skill added successfully",
  data:skillsAdded
})

})

export const updateSkill = asyncHandler(async(req,res)=>{
  const skillsUpdated = await profileService.skillsUpdated(req.student.id,req.params)
  res.status(200).json({
  success:true,
  message:"profile skill updated successfully",
  data:skillsUpdated
})
})

export const deleteSkill = asyncHandler (async(req,res)=>{
const skillDeleted = await profileService.deleteSkill(req.student.id,req.params)
res.status(200).json({
  success:true,
  message:"delete successfull"
})
})