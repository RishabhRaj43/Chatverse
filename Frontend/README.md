# General Info

## For Incoming Message Notification

- `<NewMessageNoti data={data} toastId={t.id} toastIsVisible={t.visible} />`
  <br />
  **Where data will contain the message, avatar, sender and t.id is the toast id and t.visible is the toast visibility.**

## API CALLS

### User APIs

- Create User - [POST] `/api/auth/signup`
- Login User - [POST] `/api/auth/login`
- Logout User - [GET] `/api/auth/logout`
- Get User - [GET] `/api/auth/user-info`
- Update User - [PUT] `/api/auth/update-user`
- Upload Image/Avatar - [POST] `/api/auth/upload-avatar`

### Contact APIs

- Save Contact - [POST] `/api/user/contact/save-contact`
- Delete Contact - [DELETE] `/api/user/contact/delete-contact`
- Get Contacts - [GET] `/api/user/contact/get-contacts`
- Get Contact - [GET] `/api/user/contact/contact-info`

### Socket APIs

- Send Message - [POST] `new-message`
- Receive Message - [POST] `receive-message`

### Chat APIs

- Get Chat - [GET] `/api/auth/user/get-chat/:id`
- Get Chats - [GET] `/api/auth/user/get-all-chats`
- Delete Chat - [DELETE] `/api/auth/user/delete-chat` ❌

### Group Chat APIs

#### User

- Get Group Info - [POST] `/api/auth/user/get-group-info/:handle`
- Get Group Chat - [GET] `/api/auth/user/get-group-chat/:id`
- Get Group Chats - [GET] `/api/auth/user/get-all-group-chats`
- Join Group Chat - [POST] `/api/auth/group/join-group/:handle`
- Create Group Chat - [POST] `/api/auth/user/create-group-chat`
- Leave Group Chat - [POST] `/api/auth/user/leave-group/:groupId`

#### Admin

- Delete Group Chat - [DELETE] `/api/auth/user/delete-group`
- Remove Group Member - [POST] `/api/auth/user/remove-member/:groupId`
- Add Group Member - [POST] `/api/auth/user/add-member/:groupId`

