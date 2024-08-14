import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateProps {
  component: JSX.Element;
}

const Private: React.FC<PrivateProps> = ({ component }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  return user ? component : <Navigate to="/login" />;
};

export default Private;
