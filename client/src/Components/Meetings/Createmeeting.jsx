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
      <div className="flex items-center justify-center py-12 px-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-2xl space-y-8 border-t-4 border-purple-700"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-purple-900 mb-2">Schedule Meeting</h1>
            <p className="text-gray-500">Organize your next gathering with ease!</p>
            {currentUserEmail && (
              <p className="text-sm text-gray-400 mt-2">
                Logged in as: <span className="font-semibold">{currentUserEmail}</span>
              </p>
            )}
          </div>

          <div className="space-y-6">
            {/* Inputs */}
            {[
              { label: "Meeting Title", name: "title", type: "text" },
              { label: "Meeting Description", name: "description", type: "textarea" },
              { label: "Participants (comma separated emails)", name: "participants", type: "text" },
              { label: "Meeting Date", name: "date", type: "date" },
            ].map(({ label, name, type }) => (
              <div key={name} className="relative">
                {type === "textarea" ? (
                  <textarea
                    name={name}
                    value={meetingData[name]}
                    onChange={handleChange}
                    required
                    className="peer w-full border-b-2 border-gray-300 focus:border-purple-700 outline-none py-3 placeholder-transparent"
                    placeholder={label}
                  />
                ) : (
                  <input
                    type={type}
                    name={name}
                    value={meetingData[name]}
                    onChange={handleChange}
                    required
                    className="peer w-full border-b-2 border-gray-300 focus:border-purple-700 outline-none py-3 placeholder-transparent"
                    placeholder={label}
                  />
                )}
                <label className="absolute left-0 -top-3.5 text-purple-900 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
                  {label}
                </label>
              </div>
            ))}

            {/* Time Inputs */}
            <div className="flex gap-4">
              {["startTime", "endTime"].map((field) => (
                <div key={field} className="relative w-full">
                  <input
                    type="time"
                    name={field}
                    value={meetingData[field]}
                    onChange={handleChange}
                    required
                    className="peer w-full border-b-2 border-gray-300 focus:border-purple-700 outline-none py-3 placeholder-transparent"
                  />
                  <label className="absolute left-0 -top-3.5 text-purple-900 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
                    {field === "startTime" ? "Start Time" : "End Time"}
                  </label>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <button
              type="button"
              onClick={handleFetchParticipants}
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-gold-200 font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Loading..." : "Fetch Participants"}
            </button>

            {participantNames.length > 0 && (
              <div className="mt-4 text-gray-700">
                <h3 className="font-semibold mb-2">Selected Participants:</h3>
                <ul className="list-disc ml-5">
                  {participantNames.map((p, idx) => (
                    <li key={idx}>
                      {p.name} (Email: {p.email})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conflict & Alternate */}
            {conflictDetected && (
              <div className="text-red-500 font-bold text-center">
                Conflict detected! Please check alternate dates.
              </div>
            )}
            {alternateDates.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-purple-900 text-lg">Suggested Alternate Slots</h3>
                {alternateDates.map((slot, idx) => {
                  const startDate = new Date(slot.startTime);
                  const endDate = new Date(slot.endTime);
                  return (
                    <div
                      key={idx}
                      className="bg-gray-100 rounded-lg p-4 shadow hover:shadow-lg transition-all"
                    >
                      <div className="font-semibold">{startDate.toLocaleDateString()}</div>
                      <div className="text-sm">
                        {startDate.toLocaleTimeString()} - {endDate.toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-yellow-300 font-semibold py-3 rounded-lg transition mt-4"
            >
              {loading ? "Creating Meeting..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
