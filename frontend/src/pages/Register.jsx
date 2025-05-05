import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const ErrorModal = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h3 className="text-lg font-semibold mb-4">Error</h3>
        <p className="text-gray-700 mb-4">{message}</p>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrormessage] = useState();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(data) {
    try {
      const res = await registerUser(data);
      console.log(res);
      toast.success("Registration successful!");
      navigate("/users");
    } catch (error) {
      // const msg =
      //   error.response?.data?.error ||
      //   "This email is already registered. Try another one";
      const msg = error.response?.data.error || "Registration failed.";
      console.log(error);
      setErrormessage(msg);
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100">
      <div className="rounded-3xl bg-white/70 backdrop-blur-md p-10 shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-semibold mb-8 text-center text-blue-700 font-sans tracking-wide">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            {errors.name && (
              <span className="text-red-600 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <span className="text-red-600 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <span className="text-red-600 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-all duration-200"
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <div className="text-sm text-gray-600 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
      <ErrorModal message={errorMessage} onClose={() => setErrormessage("")} />
    </div>
  );
};

export default Register;
