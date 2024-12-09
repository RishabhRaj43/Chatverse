# ChatVerse - Advanced Real-Time Chat App

Welcome to **ChatVerse**, an advanced real-time chat application designed to offer seamless communication for both individual and group chats. Whether you're looking for private conversations or group collaboration, **ChatVerse** makes it easy to stay connected and communicate in real-time.

## Key Features

### 1. **Real-Time Messaging**
   - **Instant Message Delivery**: Messages are delivered instantly to the recipient, ensuring smooth and uninterrupted conversations.
   - **Message Read Status**: Real-time updates when your message is seen.

### 2. **Group Chats**
   - **Create and Manage Groups**: Easily create and manage group chats with your friends, colleagues, or team members.
   - **Add/Remove Members**: Invite new members or remove existing ones as needed.
   - **Join and Leave Groups**: Join group chats and leave them with a simple click.

### 3. **User Management**
   - **Secure Authentication**: Register and log in securely to access your account.
   - **Profile Customization**: Personalize your profile by uploading an avatar and updating your information.
   - **Manage Contacts**: Save, view, block, and unblock contacts to stay connected with the right people.

### 4. **Push Notifications**
   - **New Message Notifications**: Receive real-time notifications when someone sends you a message.
   - **Group Message Alerts**: Stay updated on group chats with immediate alerts.

---

## Socket Events

**ChatVerse** leverages **Socket.io** for real-time communication, enabling efficient message exchange. Below are the key socket events used for handling individual and group chats:

### **Individual Chat Events**

- **Send Message**
  - Event: `send-user-message`
  - Description: Sends a message to another user.

- **Delete Message**
  - Event: `delete-message`
  - Description: Deletes a message from the chat.

- **Block/Unblock Contact**
  - Event: `block-contact` / `unblock-contact`
  - Description: Blocks or unblocks a contact in your contact list.

- **Check If Blocked**
  - Event: `am-i-blocked`
  - Description: Checks if a user has blocked you.

- **Request Online Users**
  - Event: `request-online-users`
  - Description: Requests the list of currently online users.

- **Read Messages**
  - Event: `read-messages`
  - Description: Marks messages as read.

### **Group Chat Events**

- **Create Group**
  - Event: `group-created`
  - Description: Creates a new group chat.

- **Join Group**
  - Event: `group-joined`
  - Description: Joins an existing group chat.

- **Send Group Message**
  - Event: `new-group-message`
  - Description: Sends a message to the group.

- **Leave Group**
  - Event: `leave-group`
  - Description: Leaves a group chat.

- **Add/Remove Group Members**
  - Event: `add-member` / `remove-member`
  - Description: Adds or removes members from the group.

- **Request Group Online Users**
  - Event: `request-group-online-users`
  - Description: Requests the list of online users in a group.

- **Group Message Read**
  - Event: `read-group-message`
  - Description: Marks group messages as read.

---

## Getting Started

To start using **ChatVerse**, you need to:

1. **Create an account**: Sign up to become a user of the app.
2. **Log in**: Access your account securely using your credentials.
3. **Customize your profile**: Upload an avatar and update your details.
4. **Start chatting**: Connect with other users, send messages, and create group chats.

---

## Real-Time Chat Features

### Individual Chats
- **Private messaging** with users in real-time.
- **Instant message delivery** with read receipts.
  
### Group Chats
- **Group creation and management**.
- **Add or remove members** as required.
- **Real-time updates** for all members in the group.
- **Message delivery and read status** across all members.

---

## Conclusion

**ChatVerse** offers an advanced and feature-rich platform for both individual and group chats, providing a seamless real-time communication experience. With robust features like secure messaging, group management, and real-time notifications, it ensures that your conversations are efficient and dynamic. Enjoy the app and stay connected!

---
