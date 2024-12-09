import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useSocket from "../../Context/UseSocket";

const ProtectedRoutes = () => {
  const [loadingSocket, setLoadingSocket] = useState(true);
  const { socket, connectSocket } = useSocket();
  const token = localStorage.getItem("token_user");

  if (!token) {
    return <Navigate to="/auth/login" />;
  }

  useEffect(() => {
    if (token && !socket) {
      connectSocket(token); 
    }

    if (socket) {
      if (socket.connected) {
        setLoadingSocket(false);
      } else {
        socket.on("connect", () => {
          setLoadingSocket(false);
        });
        socket.connect();
      }
    }

    return () => {
      if (socket) {
        socket.off("connect"); 
        socket.disconnect();  
      }
    };
  }, [token, socket, connectSocket]); 

  return <>{loadingSocket ? <div>Connecting...</div> : <Outlet />}</>;
};

export default ProtectedRoutes;
