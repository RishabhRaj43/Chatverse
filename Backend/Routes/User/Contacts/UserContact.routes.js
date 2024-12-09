import express from "express";
import {
  blockContact,
  contactInfo,
  deleteContact,
  saveContact,
  unblockContact,
  searchContact,
  userContact,
} from "../../../Controller/User/Contact/UserContact.controller.js";

const userContactRouter = express.Router();

userContactRouter.post("/save-contact", saveContact);
userContactRouter.delete("/delete-contact/:id", deleteContact);
userContactRouter.get("/get-contacts", userContact);
userContactRouter.post("/contact-info", contactInfo);
userContactRouter.put("/block-contact/:id", blockContact);
userContactRouter.put("/unblock-contact/:id", unblockContact);

userContactRouter.post("/search-contact", searchContact);

export default userContactRouter;
