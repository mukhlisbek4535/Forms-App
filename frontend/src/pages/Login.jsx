import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  // const { setIsLoggedIn } = useContext(AuthContext);
  const { login } = useAuth();
  const location = useLocation();

  const onSubmit = async (data) => {
    try {
      await login(data);
      // const res = await axios.post("http://localhost:5001/login", data);
      // localStorage.setItem("token", res.data.token);
      // toast.success("Logged in!");
      // setIsLoggedIn(true);
      navigate(location.state?.from?.pathname || "/users");
    } catch (error) {
      toast.error("Login failed: " + error.response.data.message);
      alert(error.response.data.error);
    }
  };
  // async function handleSubmit(e) {
  //   e.preventDefault();

  //   await fetch("https://localhost:5001/login", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, password }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.token) {
  //         localStorage.setItem("token", data.token);
  //         setIsLoggedIn(true);
  //         navigate("/users");
  //       } else {
  //         alert(data.error);
  //       }
  //     })
  //     .catch((err) => console.error("Login error", err));
  // }
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-1/2 flex items-center justify-center">
        <div className="rounded-3xl bg-white/70 backdrop-blur-md p-10 shadow-xl w-full max-w-md border border-gray-200">
          <h2 className="text-3xl text-blue-600 font-bold text-center mb-4 font-[Poppins]">
            Sign-in to the App
          </h2>
          <p className="text-sm text-grey-800 text-center mb-6 font-medium">
            Welcome back! Please enter your details.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="relative">
              <label className="mb-1 text-sm font-medium text-gray-700 block">
                Email
              </label>
              <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-10 transform -translate-y-1/2 mt-1 pointer-events-none" />
              <input
                {...register("email", {
                  required: "Email is required!",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                placeholder="Email..."
                className="focus:ring-2 focus:ring-blue-500 focus:outline-none w-full border rounded-xl px-10 py-2"
              />
              {errors.email && <span>{errors.email.message}</span>}
            </div>
            <div className="relative">
              <label className="mb-1 text-sm font-medium text-gray-700 block">
                Password
              </label>
              <LockClosedIcon className="h-5 w-5 text-gray-400 absolute mt-6 left-3 top-2.5 pointer-events-none" />
              <input
                {...register("password", {
                  required: "Password is required!",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                type="password"
                placeholder="Password..."
                className="focus:ring-2 focus:ring-blue-500 focus:outline-none w-full border rounded-xl px-10 py-2"
              />
              {errors.password && <span>{errors.password.message}</span>}
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="accent-blue-600 rounded focus:ring-0"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-800 transition-all duration-200"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            <div className="text-sm text-center text-gray-600 mt-4">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center bg-blue-200 p-4">
        <img
          src="login.svg"
          alt="Login Illustration"
          className="w-3/4 max-w-md"
        />
        <p className="text-xl text-blue-700 font-semibold">
          Welcome to our App! 😊
        </p>
      </div>
    </div>
  );
};

export default Login;
