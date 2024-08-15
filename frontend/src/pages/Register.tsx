import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (formState.confirmPassword !== formState.password) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await register(formState.email, formState.password);
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred during registration."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.h1
            className="mx-auto h-12 w-auto text-2xl"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Real <span className="text-blue-500 font-bold text-3xl">Notes</span>
          </motion.h1>
          <motion.h2
            className="mt-6 text-3xl font-extrabold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Create a new account
          </motion.h2>
        </div>
        {error && (
          <motion.p
            className="text-red-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm flex flex-col gap-3">
            <Input
              label="Email address"
              name="email"
              type="email"
              required
              value={formState.email}
              onChange={handleInputChange}
              className="rounded-t-md"
              disabled={isLoading}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={formState.password}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              value={formState.confirmPassword}
              onChange={handleInputChange}
              className="rounded-b-md"
              disabled={isLoading}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </div>
        </form>
        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
