import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token."
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  /*
   * Steps
   * 1. get user details from frontend.
   * 2. validation - not empty
   * 3. check if user already exists : username, email
   * 4. check for images, check for avater
   * 5. upload them to cloudinary, avatar
   * 6. create user object - create entry in db
   * 7. remove password and refresh token field from response
   * 8. check for user creation
   * 9. return res
   */

  const { username, fullName, email, password } = req.body;

  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All feilds are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log("existedUser", existedUser);

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const converLocalPath = req.files?.coverImage?.[0]?.path;
  // console.log('req.files',req.files)

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is requried");
  }

  let converImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    converImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const converImage = await uploadOnCloudinary(converImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required.");
  }

  const user = await User.create({
    fullName,
    avatar: avatar?.url,
    converImage: converImage?.url || "",
    email,
    password,
    username: username?.toLowerCase(),
  });

  const createdUser = await User.findById(user?._id)?.select(
    "-password -refershToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  /**
   * req body ->data
   * username or email
   * find the user
   * password check
   * access and refresh token
   * send cookie
   */

  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required.");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exit.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  /*
   * remove cookie
   * remove rfresh token
   */
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refershToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
try {
    const incomingRefreshToken = req.cookies.refershToken || req.body.refershToken;
  
    if(!incomingRefreshToken){
      throw new ApiError(401,'Unathorized refresh token')
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken, 
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401, 'Invalid refresh token')
    }
  
    if(incomingRefreshToken !== user.refershToken){
      throw new ApiError(401, "Refresh token is expired or used.")
    }
  
    const options ={
      httpOnly:true,
      secure: true
    }
  
   const{accessToken, newRefershToken} =  await generateAccessAndRefreshToken(user_id);
  
    return res.status(200)
    .cookie('accessToken',accessToken, options )
    .cookie('refreshToken', newRefershToken, options)
    .json(
      new ApiResponse(
        200, 
        {accessToken, newRefershToken},
        "Access token refreshed"
      )
    )
} catch (error) {
  throw new ApiError(401, error?.message || 'Invalid refresh token')
}
});

const getUserDeatils = asyncHandler(async(req, res)=>{
  const {id} = req.body;

  if(!id){
    throw new ApiError(401, 'User Id is required.')
  }
  const user = await User.findById({_id: id})
  if(!user){
    throw new ApiError(401,'User not found.')
  }

  const userDetails = await User.findById({_id: id}).select("-password -refreshToken -accessToken")
  
  return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            user: userDetails,
          },
          "User details found Successfully"
        )
      );
})

const updateUserById = asyncHandler(async(req, res)=>{
  const {fullName} = req.body;
  const {id} = req.params;

  if(!id){
    throw new ApiError(401, 'Invalid user Id')
  }

  const user = await User.findById({_id: id})
  if(!user){
    throw new ApiError(401, 'User not found')
  }

  user.fullName = fullName || user.fullName;
  const updateUser = await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200,
        {
          user: updateUser
        },
        'User updated successfully'
      )
    )
})

const getAllUser=asyncHandler(async(req, res)=>{
  // const user = await User.findById({_id:req.user._id})
  // if(!user){
  //   throw new ApiError(401, 'User does not exit')
  // }
  const allUser = await User.find().select('-password -accessToken -refreshToken')
  if(!allUser){
    throw new ApiError(401, "No user found")
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          users:allUser
        },
        'User fetch Successfull'
      )
    )
})

const getDeleteUser=asyncHandler(async(req, res)=>{
  const {id} = req.params
  if(!id){
    throw new ApiError(401, 'Invalid User Id')
  }
  const user = await User.findById({_id:id})
  if(!user){
    throw new ApiError(401, 'User does not exits')
  }
  await User.deleteOne({_id: id})
  
  return res
    .status(200)
    .json(
      new ApiResponse(201,
        {},
        "User deleted Successfully"
      )
    )
})


export { 
  registerUser,
  loginUser, 
  logoutUser,
  refreshAccessToken,
  getUserDeatils,
  updateUserById,
  getAllUser,
  getDeleteUser
};
