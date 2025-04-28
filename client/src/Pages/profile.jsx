import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";

export default function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get("http://localhost:3000/checkauth", {
          withCredentials: true,
        });

        if (response.status === 201) {
          setUserDetails({
            name: response.data.name,
            email: response.data.email,
            image: response.data.image,
            userId: response.data._id,
          });
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (userDetails && userDetails.userId) {
        try {
          const meetingRes = await axios.post("http://localhost:3000/allmeetings", {
            user_id: userDetails.userId,
          });

          const today = new Date();
          const formattedEvents = meetingRes.data.meetings
            .filter((meeting) => {
              const meetingDate = new Date(meeting.startTime);
              return (
                meetingDate.getDate() === today.getDate() &&
                meetingDate.getMonth() === today.getMonth() &&
                meetingDate.getFullYear() === today.getFullYear()
              );
            })
            .map((meeting, index) => ({
              id: index,
              title: meeting.title,
              start: new Date(meeting.startTime),
              end: new Date(meeting.endTime),
              description: meeting.description,
            }));

          setMeetings(formattedEvents);
        } catch (error) {
          console.error("Error fetching meetings:", error);
        }
      }
    };

    fetchMeetings();
  }, [userDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="text-xl font-semibold">Loading...</span>
      </div>
    );
  }

  if (!userDetails) {
    return null;
  }

  const todayDate = new Date().toLocaleDateString();

  return (
    <div>
      <Navbar />
      <div className="flex">
        {/* Sidebar Section */}
        <div className="w-64 bg-gray-800 text-white p-6 h-screen overflow-y-auto flex flex-col justify-between">
          <div>
            <span className="text-xs text-gray-400">{todayDate}</span>
            <div className="text-center mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Today's Meetings...</h2>
            </div>
            <div className="flex flex-col items-center space-y-4 mt-8">
              <button
                onClick={() => navigate("/create")}
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-yellow-300 text-sm px-4 py-2 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <span className="mr-2 text-xl">+</span> Schedule new Meeting
              </button>
            </div>
            <div className="space-y-4 mt-6">
              {meetings.length > 0 ? (
                meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300"
                  >
                    <h3 className="text-lg font-semibold">{meeting.title}</h3>
                    <p className="text-sm text-gray-300">{meeting.description}</p>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <p>
                        {meeting.start.toLocaleTimeString()} - {meeting.end.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">You have no meetings today</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex-1 p-8 bg-purple-50">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg">
            <div className="flex flex-col items-center">
              {/* Profile Image */}
              {userDetails.image ? (
                <img 
                  style={{ objectFit: "cover", objectPosition: "top center" }}
                  src={userDetails.image}
                  alt="Profile"
                  className="w-36 h-36 rounded-full border-4 border-purple-600 shadow-2xl mb-6"
                />
              ) : (
                <div className="w-36 h-36 rounded-full bg-gray-400 border-4 border-purple-600 shadow-2xl mb-6"></div>
              )}

              {/* User Info */}
              <div className="text-center">
                <h1 className="text-4xl font-bold text-purple-800 mb-2">{userDetails.name}</h1>
                <p className="text-lg text-gray-500 mb-4">{userDetails.email}</p>
              </div>

              {/* View Upcoming Meetings Button */}
              <div className="flex justify-center w-full mt-6">
                <button
                  onClick={() => navigate("/calendar")}
                  className="flex items-center bg-purple-600 hover:bg-purple-700 text-yellow-300 text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  View Upcoming Meetings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
