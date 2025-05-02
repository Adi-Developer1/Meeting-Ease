import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { toast, ToastContainer } from "react-toastify";

export default function CreateMeeting() {
  const navigate = useNavigate();

  const [meetingData, setMeetingData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    participants: "",
    description: "",
  });

  const [conflictDetected, setConflictDetected] = useState(false);
  const [alternateDates, setAlternateDates] = useState([]);
  const [participantNames, setParticipantNames] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/checkauth", {
          withCredentials: true,
        });
        setCurrentUserEmail(res.data.email);
        setCurrentUserId(res.data._id);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Authentication failed. Please log in again.");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setMeetingData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFetchParticipants = async () => {
    if (!currentUserEmail) {
      toast.info("Fetching user info... Please wait.");
      return;
    }

    const emails = meetingData.participants
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email && email !== currentUserEmail.toLowerCase());

    if (emails.length === 0) {
      toast.error("Please enter participant emails (excluding yourself).");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/members", { emails });

      if (res.data && res.data.participants) {
        setParticipantNames(res.data.participants);
        setMeetingData((prev) => ({
          ...prev,
          participants: emails.join(", "),
        }));
      } else {
        toast.error("No participants found for the provided emails.");
        setParticipantNames([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching participants.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, date, startTime, endTime, description } = meetingData;
    const participantIds = participantNames.map((p) => p.id);

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    const payload = {
      title,
      description,
      date,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      participantIds,
      user_id: currentUserId,
    };

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/schedulemeeting", payload);

      if (res.data.message === "Conflict detected with existing meetings.") {
        setConflictDetected(true);
        toast.error("Conflict detected with existing meetings.");
      } else {
        toast.success("Meeting Created Successfully!");
        // navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleSeeAlternateDays = async () => {
    try {
      setLoading(true);
      const startDateTime = new Date(`${meetingData.date}T${meetingData.startTime}`);
      const endDateTime = new Date(`${meetingData.date}T${meetingData.endTime}`);

      const res = await axios.post("http://localhost:3000/otherdates", {
        date: meetingData.date,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        participants: participantNames.map((p) => p.id),
        user_id: currentUserId,
      });

      if (res.data.suggestedSlots) {
        setAlternateDates(res.data.suggestedSlots);
        toast.success("Alternate dates found!");
      } else {
        toast.error("No alternate dates available.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching alternate dates.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-gradient-to-b from-purple-100 to-purple-200 min-h-screen">
      <Navbar />
      <ToastContainer />
      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto mt-10 shadow-2xl rounded-3xl overflow-hidden bg-white">
        
        {/* Sidebar */}
        <div className="bg-purple-700 text-white w-full lg:w-1/3 p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Schedule Your Meeting</h2>
            <p className="text-purple-200">
              Easily schedule meetings, manage participants, and get intelligent suggestions when conflicts occur.
            </p>
          </div>
          {currentUserEmail && (
            <div className="mt-8 text-sm text-purple-100">
              Logged in as:
              <br />
              <span className="font-semibold">{currentUserEmail}</span>
            </div>
          )}
        </div>
  
        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full lg:w-2/3 p-10 space-y-8"
        >
          {/* Title & Description */}
          <div>
            <label className="block font-semibold text-purple-900">Meeting Title</label>
            <input
              type="text"
              name="title"
              value={meetingData.title}
              onChange={handleChange}
              required
              className="w-full border-b-2 border-gray-300 focus:border-purple-700 py-2 outline-none bg-transparent"
            />
          </div>
  
          <div>
            <label className="block font-semibold text-purple-900">Description</label>
            <textarea
              name="description"
              value={meetingData.description}
              onChange={handleChange}
              required
              className="w-full border-b-2 border-gray-300 focus:border-purple-700 py-2 outline-none bg-transparent resize-none"
            />
          </div>
  
          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-purple-900">Meeting Date</label>
              <input
                type="date"
                name="date"
                value={meetingData.date}
                onChange={handleChange}
                required
                className="w-full border-b-2 border-gray-300 focus:border-purple-700 py-2 outline-none bg-transparent"
              />
            </div>
            <div>
              <label className="block font-semibold text-purple-900">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={meetingData.startTime}
                onChange={handleChange}
                required
                className="w-full border-b-2 border-gray-300 focus:border-purple-700 py-2 outline-none bg-transparent"
              />
            </div>
            <div>
              <label className="block font-semibold text-purple-900">End Time</label>
              <input
                type="time"
                name="endTime"
                value={meetingData.endTime}
                onChange={handleChange}
                required
                className="w-full border-b-2 border-gray-300 focus:border-purple-700 py-2 outline-none bg-transparent"
              />
            </div>
          </div>
  
          {/* Participants */}
          <div>
            <label className="block font-semibold text-purple-900">
              Participants (comma-separated emails)
            </label>
            <input
              type="text"
              name="participants"
              value={meetingData.participants}
              onChange={handleChange}
              required
              className="w-full border-b-2 border-gray-300 focus:border-purple-700 py-2 outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={handleFetchParticipants}
              disabled={loading}
              className="mt-3 bg-purple-700 hover:bg-purple-800 text-yellow-200 font-medium px-4 py-2 rounded-lg transition"
            >
              {loading ? "Loading..." : "Fetch Participants"}
            </button>
          </div>
  
          {/* Display Fetched Participants */}
          {participantNames.length > 0 && (
            <div className="bg-gray-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Participants Found:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {participantNames.map((p, idx) => (
                  <li key={idx}>{p.name} ({p.email})</li>
                ))}
              </ul>
            </div>
          )}
  
          {/* Conflict Notice + Suggest Button */}
          {conflictDetected && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 text-red-700 rounded-lg space-y-2">
              <div><strong>Conflict detected!</strong> Your meeting overlaps with existing schedules.</div>
              <button
                type="button"
                onClick={handleSeeAlternateDays}
                className="bg-purple-600 hover:bg-purple-700 text-yellow-100 px-4 py-2 rounded-lg font-semibold"
              >
                See Suggested Slots
              </button>
            </div>
          )}
  
          {/* Alternate Suggestions */}
          {alternateDates.length > 0 && (
            <div className="bg-gray-100 border-l-4 border-purple-400 p-4 rounded-lg space-y-2">
              <h4 className="font-bold text-purple-900 mb-2">Suggested Alternate Time Slots</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alternateDates.map((slot, idx) => {
                  const start = new Date(slot.startTime);
                  const end = new Date(slot.endTime);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg shadow border border-purple-100"
                    >
                      <div className="text-purple-900 font-semibold">
                        {start.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-700">
                        {start.toLocaleTimeString()} - {end.toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
  
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 hover:bg-purple-800 text-yellow-200 font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Creating Meeting..." : "Create Meeting"}
          </button>
        </form>
      </div>
    </div>
  );
  
  
}
