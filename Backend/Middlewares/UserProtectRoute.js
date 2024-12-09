import jwt from "jsonwebtoken";
import User from "../Models/User/User.model.js";

const userProtectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token_user;

    if (!token) {
      return res.status(401).json({ message: "No Token Found" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    const user = await User.findById(decoded.userid);

    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export default userProtectRoute;
