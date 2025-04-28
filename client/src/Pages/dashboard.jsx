import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:3000/checkauth", {
          withCredentials: true,
        });
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="bg-purple-950 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="max-w-7xl mx-auto py-16 px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-yellow-400 mb-4">
              Welcome to Dashboard!
            </h1>
            <p className="text-yellow-200 text-lg">
              Manage your meetings efficiently and stay organized
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <Link
              to="/calendar"
              className="group p-8 bg-purple-900 rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-yellow-400"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6 mx-auto">
                <span className="text-3xl text-purple-900">📅</span>
              </div>
              <h2 className="text-2xl font-bold text-center text-yellow-300 mb-4 group-hover:text-yellow-400 transition">
                Calendar Viewing
              </h2>
              <p className="text-center text-yellow-200">
                See all your scheduled meetings clearly in all format.
              </p>
            </Link>

            <Link
              to="/create"
              className="group p-8 bg-purple-900 rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-yellow-400"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6 mx-auto">
                <span className="text-3xl text-purple-900">➕</span>
              </div>
              <h2 className="text-2xl font-bold text-center text-yellow-300 mb-4 group-hover:text-yellow-400 transition">
                Create Meeting
              </h2>
              <p className="text-center text-yellow-200">
                Set up new meetings and invite participants seamlessly.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
