import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

export const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid username or password");
  }

  res.json({
    _id: admin._id,
    name: admin.name,
    username: admin.username,
    token: generateToken(admin._id),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.admin);
});