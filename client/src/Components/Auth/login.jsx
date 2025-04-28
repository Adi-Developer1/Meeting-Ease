import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import Navbar from "../Navbar";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/checkauth", {
          withCredentials: true
        });
        navigate("/dashboard");
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      toast.success("Welcome!", { autoClose: 2000 });
      navigate('/dashboard');
    } catch (error) {
      toast.error("Invalid Credentials!", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 to-purple-200 flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md border-t-4 border-purple-700">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-900">Sign In</h1>
            <p className="text-gray-600 mt-2 text-sm">to continue to Meeting_Ease!</p>
          </div>
          <ToastContainer />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 transition"
                onChange={handleChange}
                required
              />
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 transition"
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full bg-purple-700 hover:bg-purple-800 text-yellow-300 font-semibold py-3 rounded-xl transition-all duration-300 flex justify-center items-center ${
                loading ? "cursor-not-allowed opacity-80" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Next"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              New to Meeting_Ease!?{" "}
              <Link
                to="/register"
                className="text-purple-700 hover:underline font-semibold"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
