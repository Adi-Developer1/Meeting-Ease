import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { 
  format, 
  parse, 
  startOfWeek, 
  getDay, 
  isSameDay, 
  compareAsc, 
  addDays 
} from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import axios from "axios";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMeetings, setSelectedMeetings] = useState([]);
  const [view, setView] = useState(Views.MONTH);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const authRes = await axios.get('http://localhost:3000/checkauth', { 
          withCredentials: true 
        });
        const userId = authRes.data._id;
        const meetingRes = await axios.post('http://localhost:3000/allmeetings', { 
          user_id: userId 
        });
        
        const formattedEvents = meetingRes.data.meetings.map((meeting, index) => ({
          id: index,
          title: meeting.title,
          start: new Date(meeting.startTime),
          end: new Date(meeting.endTime),
          description: meeting.description
        }));

        setEvents(formattedEvents);
        updateMeetingsForDate(new Date());
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
      }
    }

    fetchMeetings();
  }, []);

  const updateMeetingsForDate = (date) => {
    const meetingsOnDate = events
      .filter(event => isSameDay(event.start, date))
      .sort((a, b) => compareAsc(a.start, b.start));
    setSelectedMeetings(meetingsOnDate);
  };

  const handleSelectSlot = (slotInfo) => {
    const clickedDate = slotInfo.start;
    setSelectedDate(clickedDate);
    updateMeetingsForDate(clickedDate);
    setView(Views.DAY);
  };

  const handleSelectEvent = (event) => {
    setSelectedDate(event.start);
    updateMeetingsForDate(event.start);
    setView(Views.DAY);
  };

  const handleNavigate = (newDate) => {
    setSelectedDate(newDate);
    updateMeetingsForDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
    if (newView === Views.DAY) {
      updateMeetingsForDate(selectedDate);
    }
  };

  const handlePrevious = () => {
    const newDate = addDays(selectedDate, -1);
    setSelectedDate(newDate);
    updateMeetingsForDate(newDate);
  };

  const handleNext = () => {
    const newDate = addDays(selectedDate, 1);
    setSelectedDate(newDate);
    updateMeetingsForDate(newDate);
  };

  const EventComponent = ({ event }) => (
    <div className="p-1 text-white font-semibold">
      <strong>{event.title}</strong>
      {event.description && <div className="text-xs text-gray-200">{event.description}</div>}
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="p-8 bg-purple-950 min-h-screen">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-yellow-400 drop-shadow-lg">
          Your Meetings
        </h2>

        {/* Date Navigation */}
        {view === Views.DAY && (
          <div className="flex justify-center items-center gap-4 mb-6">
            <button
              onClick={handlePrevious}
              className="px-4 py-2 rounded bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold shadow-md"
            >
              Previous
            </button>
            <h3 className="text-2xl font-bold text-yellow-300">
              {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </h3>
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold shadow-md"
            >
              Next
            </button>
          </div>
        )}

        {/* View Switcher */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => handleViewChange(Views.MONTH)}
            className={`px-4 py-2 rounded ${
              view === Views.MONTH
                ? "bg-yellow-400 text-purple-900 font-bold"
                : "bg-gray-300 text-purple-900"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange(Views.WEEK)}
            className={`px-4 py-2 rounded ${
              view === Views.WEEK
                ? "bg-yellow-400 text-purple-900 font-bold"
                : "bg-gray-300 text-purple-900"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange(Views.DAY)}
            className={`px-4 py-2 rounded ${
              view === Views.DAY
                ? "bg-yellow-400 text-purple-900 font-bold"
                : "bg-gray-300 text-purple-900"
            }`}
          >
            Day
          </button>
        </div>

        {/* Calendar Section */}
<div className="rounded-lg shadow-md p-4 bg-white">
  <Calendar
    localizer={localizer}
    events={events}
    startAccessor="start"
    endAccessor="end"
    style={{ height: 600 }}
    selectable
    view={view}
    date={selectedDate}
    onNavigate={handleNavigate}
    onView={handleViewChange}
    onSelectSlot={handleSelectSlot}
    onSelectEvent={handleSelectEvent}
    components={{
      event: EventComponent,
    }}
    eventPropGetter={() => ({
      style: {
        backgroundColor: "#6b21a8", // Deep Purple for event background
        color: "#ffffff",            // White text
        fontWeight: "bold",
        borderRadius: "6px",
        border: "none",
        padding: "2px 6px",
        fontSize: "14px",
      },
    })}
    dayLayoutAlgorithm="no-overlap"
  />
</div>


        {/* Meetings on Selected Date */}
        {view !== Views.DAY && (
          <div className="mt-10 bg-purple-900 rounded-lg shadow-md p-6">
            <h3 className="text-3xl font-bold mb-4 text-center text-yellow-300 drop-shadow">
              Meetings on {format(selectedDate, 'MMMM dd, yyyy')}
            </h3>

            {selectedMeetings.length === 0 ? (
              <p className="text-center text-white text-lg">
                No meetings scheduled for this date.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-purple-800 p-4 rounded-lg border border-yellow-300 shadow-sm"
                  >
                    <p className="text-md text-yellow-200 mb-1 font-semibold">
                      {format(meeting.start, 'h:mm a')} - {format(meeting.end, 'h:mm a')}
                    </p>
                    <h4 className="text-lg font-bold text-yellow-400">
                      {meeting.title}
                    </h4>
                    {meeting.description && (
                      <p className="text-gray-100 text-sm mt-1">
                        {meeting.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
