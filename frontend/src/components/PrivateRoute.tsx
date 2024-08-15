import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loading } from "./loading";
interface PrivateProps {
  component: JSX.Element;
}

const Private: React.FC<PrivateProps> = ({ component }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center h-screen justify-center w-full"><Loading/></div>
  }
  return user ? component : <Navigate to="/login" />;
};

export default Private;
