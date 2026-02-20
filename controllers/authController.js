import User from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Logger } from "../controllers/Logger.js";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

//register user
const registerUser = async (req, res) => {
  try {
    const { firstName, middleName, lastName, username, email, password, role } =
      req.body;

    const checkExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!username || !firstName || !username || !lastName || !email) {
      Logger.error(
        "Compulsory feilds are required",
        { success: false, target: "Authentication" },
        "auth"
      );
      return res.status(400).json({
        success: false,
        message: "Compulsory feilds are required",
      });
    }

    if (checkExistingUser) {
      Logger.warn(
        "Username or Password already exist. Kindly check and retry",
        { success: false, target: "Authentication" },
        "auth"
      );
      return res.status(400).json({
        success: false,
        message: "Username or Password already exist. Kindly check and retry",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/;

    if (!passwordRegex.test(password)) {
      Logger.warn(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
        { success: false, target: "Authentication" },
        "auth"
      );
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }
    // (?=.*[a-z]) → must contain a lowercase letter
    // (?=.*[A-Z]) → must contain an uppercase letter
    // (?=.*\d) → must contain a number
    // (?=.*[!@#$%^&*...]) → must contain one special character
    // .{8,} → at least 8 characters total

    const newUser = new User({
      username,
      firstName,
      middleName,
      lastName,
      email,
      password: bcrypt.hashSync(password, 8),
      role,
    });

    const savedUser = await newUser.save();
    Logger.info(
      "User registered successfully",
      { success: true, target: "Authentication", details: savedUser },
      "AuditTrail"
    );
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: savedUser,
    });
  } catch (err) {
    Logger.error(
      "Something went wrong while creating user",
      {
        success: true,
        target: "Authentication",
        details: err.message,
        debug: err.stack,
      },
      "AuditTrail"
    );
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating user",
      error: err.message,
    });
  }
};

//login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      Logger.warn(
        "Username and password are required",
        { success: false, target: "Authentication" },
        "auth"
      );
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      Logger.error(
        "Username does not exist. Kindly register to proceed",
        { success: false, target: "Authentication" },
        "auth"
      );
      return res.status(400).json({
        success: false,
        message: "Username does not exist. Kindly register to proceed",
      });
    }

    let validPassword = false;

    if (user) {
      validPassword = await bcrypt.compare(password, user.password);
    }

    if (!validPassword) {
      Logger.error(
        "Wrong password, kindly check and try again",
        { success: false, target: "Authentication" },
        "AuditTrail"
      );
      return res.status(400).json({
        success: false,
        message: "Wrong password, kindly check and try again",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      SECRET_KEY,
      {
        expiresIn: process.env.SESSION_TIME,
      }
    );

    Logger.info(
      "Login Successful",
      {
        success: true,
        target: "Authentication",
        username: user.username,
        role: user.role,
      },
      "AuditTrail"
    );
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      username: user.username,
      role: user.role,
      token,
    });
  } catch (err) {
    Logger.error(
      "Something went wrong, please try again",
      {
        success: true,
        target: "Authentication",
        details: err.message,
        debug: err.stack,
      },
      "AuditTrail"
    );
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
      error: err.message,
    });
  }
};

// password reset (situation where user is able to login)

//change password (situation where user is unable to login)

export { registerUser, loginUser };
