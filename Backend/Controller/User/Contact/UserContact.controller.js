import User from "../../../Models/User/User.model.js";

export const userContact = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "contacts",
        select: "username avatar phoneNumber email blocked createdAt",
        options: {
          sort: { username: 1 },
        },
      })
      .select("contacts");

    return res
      .status(200)
      .json({ contacts: user.contacts, userContact: req.user.contacts });
  } catch (error) {
    console.log("Error in userLogout", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const saveContact = async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber || "";
    const email = req.body.email || "";

    if (phoneNumber && phoneNumber.length !== 10) {
      return res.status(400).json({ message: "Invalid phone number" });
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (phoneNumber === req.user.phoneNumber || email === req.user.email) {
      return res
        .status(400)
        .json({ message: "You can't add yourself as a contact" });
    }

    const user = await User.findOne({
      $or: [{ phoneNumber }, { email }],
    }).select("username avatar email phoneNumber");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (req.user.contacts.includes(user._id)) {
      return res.status(400).json({ message: "Contact already exists" });
    }

    req.user.contacts.push(user._id);
    await req.user.save();
    return res
      .status(200)
      .json({ newContact: user, message: "Contact saved successfully" });
  } catch (error) {
    console.log("Error in saveContact", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    req.user.contacts = req.user.contacts.filter(
      (contact) => contact.toString() !== id.toString()
    );
    await req.user.save();
    console.log("Contact deleted successfully", req.user.contacts);

    return res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.log("Error in deleteContact", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const contactInfo = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json({
      user,
      isBlocked: req.user.blocked.includes(user._id),
      isContactSaved: req.user.contacts.includes(user._id),
    });
  } catch (error) {
    console.log("Error in searchContact", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const blockContact = async (req, res) => {
  try {
    const { id } = req.params;
    req.user.blocked.push(id);
    await req.user.save();
    return res.status(200).json({ message: "Contact blocked successfully" });
  } catch (error) {
    console.log("Error in searchContact", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unblockContact = async (req, res) => {
  try {
    const { id } = req.params;
    req.user.blocked = req.user.blocked.filter(
      (contact) => contact.toString() !== id.toString()
    );
    await req.user.save();
    return res.status(200).json({ message: "Contact unblocked successfully" });
  } catch (error) {
    console.log("Error in searchContact", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchContact = async (req, res) => {
  try {
    const { id } = req.body;

    if (id) {
      const user = await User.findById(id).select(
        "username avatar status email phoneNumber blocked"
      );
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      return res.status(200).json({
        user,
        currUserId: req.user._id,
        haveYouBlocked: req.user.blocked.includes(user._id),
      });
    }

    const { phoneNumber, email } = req.body;

    if (!phoneNumber && !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contactUser = await User.find({
      $or: [
        {
          phoneNumber,
        },
        {
          email,
        },
      ],
      _id: { $ne: req.user._id },
    }).select("username avatar status email phoneNumber");

    console.log("contactUser", contactUser);

    return res.status(200).json({ contactUser });
  } catch (error) {
    console.log("Error in searchContact", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
