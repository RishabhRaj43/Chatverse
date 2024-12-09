import User from "../../../Models/User/User.model.js";
import bcrypt from "bcryptjs";
import jsonSetToken from "../../../Utils/jwtWebToken.js";
import UserChat from "../../../Models/Chat/User/UserChat.model.js";

export const userInfo = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.log("Error in userLogout", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userSignup = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, avatar } = req.body;
    if (!username || !email || !password || !phoneNumber || !avatar) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (phoneNumber.length !== 10) {
      return res.status(400).json({ message: "Invalid phone number" });
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser && existingUser.email === email) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (existingUser && existingUser.phoneNumber === phoneNumber) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 7);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      status: "online",
      avatar,
    });

    await user.save();

    const token = jsonSetToken(user._id, res);

    return res
      .status(201)
      .json({ token, message: "User created successfully" });
  } catch (error) {
    console.log("Error in userSignup", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jsonSetToken(user._id, res);

    user.status = "online";
    await user.save();

    await UserChat.updateMany(
      { receiverId: user._id, isDelivered: false },
      { $set: { isDelivered: true } }
    );

    return res.status(200).json({
      token,
      message: "User logged in successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    console.log("Error in userLogout", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userLogout = async (req, res) => {
  try {
    res.clearCookie("token_user");
    req.user.status = "offline";
    await req.user.save();
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error in userLogout", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userUpdate = async (req, res) => {
  try {
    let isChanged = false;

    Object.keys(req.body).forEach((key) => {
      if (key !== "password" && req.body[key] !== req.user[key]) {
        isChanged = true;
      }
    });

    if (!req.body.email || !req.body.phoneNumber) {
      return res.status(400).json({ message: "Empty fields are not allowed!" });
    }

    const dateOfBirth = new Date(req.body.dateOfBirth);

    if (dateOfBirth > new Date()) {
      return res.status(400).json({ message: "Invalid date of birth!" });
    }

    // if (req.body.password) {
    //   const isPasswordValid = await bcrypt.compare(
    //     req.body.password,
    //     req.user.password
    //   );

    // }

    if (req.body.email && req.body.email !== req.user.email) {
      const existingEmail = await User.findOne({
        email: req.body.email,
        _id: { $ne: req.user._id },
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (req.body.phoneNumber && req.body.phoneNumber !== req.user.phoneNumber) {
      const existingPhoneNumber = await User.findOne({
        phoneNumber: req.body.phoneNumber,
        _id: { $ne: req.user._id },
      });
      if (existingPhoneNumber) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
    }

    if (!isChanged) {
      return res.status(400).json({ message: "User Updated successfully" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });

    return res
      .status(200)
      .json({ updatedUser, message: "User Updated successfully" });
  } catch (error) {
    console.log("Error in userUpdate", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    req.user.avatar = avatar;
    await req.user.save();
    return res.status(200).json({ message: "Avatar updated successfully" });
  } catch (error) {
    console.log("Error in uploadAvatar", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
