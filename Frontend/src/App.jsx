import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./Routes/Private/ProtectedAuth.routes";
import Login from "./Pages/SignupLogin/Login";
import Signup from "./Pages/SignupLogin/Signup";
import PrivateRoutes from "./Routes/Private/Private.routes";
import Navbar from "./Pages/Navbar/Navbar";
import Home from "./Pages/Home/Home";
import ProfileMain from "./Pages/Profile/ProfileMain";
import IndvidualChat from "./Pages/Chat/Individual/Guides/IndvidualChat";
import Group from "./Pages/Chat/Group/Group";
import ChatWithUser from "./Pages/Chat/Individual/ChatWithUser";
import useSocket from "./Context/UseSocket";
import NewMessageNoti from "./Components/UI/NewMessageNoti";
import { toast } from "react-hot-toast";
import AllContacts from "./Pages/Contacts/AllContacts";
import useProfile from "./Context/useProfile";
import ContactProfile from "./Pages/Contacts/ContactProfile";
import GroupChat from "./Pages/Chat/Group/GroupChat";
import GroupInfo from "./Pages/Chat/Group/GroupInfo/GroupInfo";

const App = () => {
  const { socket, connectSocket } = useSocket();
  const { user } = useProfile();

  useEffect(() => {
    const token = localStorage.getItem("token_user");

    if (token && !socket) {
      connectSocket(user);
    }

    if (socket) {
      socket.on("new-user-message", (data) => {
        console.log("data", data);

        if (window.location.pathname !== `/chat/${data.newMessage.senderId}`) {
          toast.custom((t) => (
            <NewMessageNoti
              data={data.newMessage}
              toastId={t.id}
              toastIsVisible={t.visible}
            />
          ));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("new-user-message");
      }
    };
  }, [socket, connectSocket, user]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/profile" element={<ProfileMain />} />
          <Route path="/group/:handle" element={<GroupInfo />} />

          <Route path="/chat/individual" element={<IndvidualChat />} />
          <Route path="/chat/:id" element={<ChatWithUser />} />

          <Route path="/chat/group" element={<Group />} />
          <Route path="/chat/group/:id" element={<GroupChat />} />

          <Route path="/contacts" element={<AllContacts />} />

          <Route path="/profile/:id" element={<ContactProfile />} />
        </Route>

        <Route element={<PrivateRoutes />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
