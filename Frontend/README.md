# API Calls and Socket Events

### Socket Events

#### **Individual Chat Events**:

- **`send-user-message`**  
  Send a message to another user.
  
- **`delete-message`**  
  Delete a previously sent message.

- **`am-i-blocked`**  
  Check if the current user is blocked by the recipient.

- **`block-contact`**  
  Block a contact from sending messages.

- **`unblock-contact`**  
  Unblock a previously blocked contact.

- **`request-online-users`**  
  Request the list of users currently online.

- **`read-messages`**  
  Mark messages as read when the user views them.

#### **Group Chat Events**:

- **`group-created`**  
  Create a new group chat.

- **`group-joined`**, **`join-group`**  
  Join an existing group chat.

- **`new-group-message`**  
  Send a new message to a group chat.

- **`join-room-group`**  
  Join a specific room within a group chat.

- **`leave-room-group`**  
  Leave a specific room within a group chat.

- **`read-group-message`**  
  Mark a group message as read.

- **`single-read-group-message`**  
  Mark a single group message as read.

- **`leave-group`**  
  Leave a group chat.

#### **Admin Group Chat Events**:

- **`remove-member`**  
  Remove a member from a group chat.

---

### API Calls

#### **User APIs**:

- **Create User**  
  `POST /api/auth/signup`  
  Create a new user.

- **Login User**  
  `POST /api/auth/login`  
  Log in a user.

- **Logout User**  
  `GET /api/auth/logout`  
  Log out the currently logged-in user.

- **Get User Info**  
  `GET /api/auth/user-info`  
  Fetch the current user’s profile.

- **Update User**  
  `PUT /api/auth/update-user`  
  Update user information.

- **Upload Image/Avatar**  
  `POST /api/auth/upload-avatar`  
  Upload a new avatar for the user.

---

#### **Contact APIs**:

- **Save Contact**  
  `POST /api/user/contact/save-contact`  
  Save a new contact.

- **Delete Contact**  
  `DELETE /api/user/contact/delete-contact`  
  Remove a contact from the list.

- **Get Contacts**  
  `GET /api/user/contact/get-contacts`  
  Retrieve all contacts for the user.

- **Get Contact Info**  
  `GET /api/user/contact/contact-info`  
  Get detailed information about a specific contact.

- **Block Contact**  
  `PUT /api/user/contact/block-contact/:id`  
  Block a contact by ID.

- **Unblock Contact**  
  `PUT /api/user/contact/unblock-contact/:id`  
  Unblock a contact by ID.

- **Search Contact**  
  `POST /api/user/contact/search-contact`  
  Search for a contact by name or details.

---

#### **Chat APIs**:

- **Get All Chats**  
  `GET /api/auth/user/get-all-chats`  
  Fetch all chats for the user.

- **Get Chat**  
  `GET /api/auth/user/get-chat/:id`  
  Retrieve a specific chat by its ID.

- **Delete Chat**  
  `DELETE /api/auth/user/delete-chat/:id`  
  Delete a specific chat.

---

#### **Group Chat APIs**:

- **Get Group Info**  
  `POST /api/auth/user/get-group-info/:handle`  
  Get information about a specific group.

- **Get Group Chat**  
  `GET /api/auth/user/get-group-chat/:id`  
  Retrieve a specific group chat by its ID.

- **Get All Group Chats**  
  `GET /api/auth/user/get-all-group-chats`  
  Fetch all group chats the user is a member of.

- **Join Group Chat**  
  `POST /api/auth/group/join-group/:handle`  
  Join a group chat using its handle.

- **Create Group Chat**  
  `POST /api/auth/user/create-group-chat`  
  Create a new group chat.

- **Leave Group Chat**  
  `POST /api/auth/user/leave-group/:groupId`  
  Leave a group chat by its ID.

- **Get Group Join Info**  
  `GET /api/auth/user/get-group-join-info/:handle`  
  Get information about the group join status.

---

#### **Admin Group Chat Actions**:

- **Delete Group Chat**  
  `DELETE /api/auth/user/delete-group/:groupId`  
  Admin action to delete a group chat.

- **Remove Group Member**  
  `POST /api/auth/user/remove-member/:groupId`  
  Admin action to remove a member from a group.

- **Add Group Member**  
  `POST /api/auth/user/add-member/:groupId`  
  Admin action to add a member to a group.

---
