import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Notes } from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Private from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Private component={<Notes />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
