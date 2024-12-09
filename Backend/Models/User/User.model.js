import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      trim: true,
      default: "Hey there, I'm using ChatVerse!",
    },
    status: {
      type: String,
      enum: ["online", "offline", "Online", "Offline"],
      default: "offline",
    },
    socialLinks: [
      {
        platform: { type: String },
        url: { type: String },
      },
    ],
    dateOfBirth: {
      type: Date,
      default: new Date(),
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    pushNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
