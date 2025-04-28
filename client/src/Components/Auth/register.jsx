import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../Navbar";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [image, setImage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/checkauth", {
          withCredentials: true,
        });
        navigate("/dashboard");
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      postDetails(file);
    }
  };

  const postDetails = async (pic) => {
    setLoading(true);
    if (!pic) {
      toast.warning("Please Select an Image", { autoClose: 2500 });
      setLoading(false);
      return;
    }
    if (pic.type === "image/jpeg" || pic.type === "image/png") {
      const data = new FormData();
      data.append("file", pic);
      data.append("upload_preset", "my_chat-app");
      data.append("cloud_name", "djmmkgei0");

      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/djmmkgei0/image/upload",
          {
            method: "post",
            body: data,
          }
        );

        const info = await response.json();
        toast.success("Image uploaded successfully!", { autoClose: 2000 });
        setImage(info.url.toString());
      } catch (err) {
        toast.error("Image can't be uploaded!", { autoClose: 2000 });
      } finally {
        setLoading(false);
      }
    } else {
      toast.warning(`${pic.type} is not supported`, { autoClose: 2500 });
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          image: image,
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if (response.status === 201) {
        navigate("/login");
      }
    } catch (error) {
      toast.error("User already Exists!", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border-t-4 border-purple-600">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-purple-800">
              Create account
            </h2>
            <p className="mt-2 text-sm text-purple-500">
              Sign up for Meeting_Ease!
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              required
            />

            {/* Image Upload Section */}
            <div className="flex flex-col items-center space-y-4">
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg, image/png"
                onChange={handleImageUpload}
                disabled={loading}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <center>
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQg8rEHz7IksKyI3ANAxTyTY8khdHFRRyK1tw&s"
                    alt="Upload"
                    width="50"
                    className="hover:opacity-80 transition"
                  />
                </center>
                <div className="text-sm text-purple-600 mt-2 text-center">
                  Upload Profile Image
                </div>
              </label>

              {loading && <p className="text-sm text-purple-600">Uploading image...</p>}

              {image && (
                <div className="mt-2">
                  <img
                    src={image}
                    alt="Uploaded preview"
                    width="150"
                    className="rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800 text-yellow-300 py-3 rounded-md flex justify-center items-center font-semibold"
              disabled={loading}
            >
              {loading ? (
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 
                    1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-700 hover:underline font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
