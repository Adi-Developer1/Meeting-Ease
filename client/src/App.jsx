import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./Pages/dashboard";
import Login from "./Components/Auth/login";
import Register from "./Components/Auth/register";
import CalendarView from "./Components/Meetings/Calendarview"; 
import CreateMeeting from "./Components/Meetings/Createmeeting"; 
import Profile from "./Pages/profile";
import AdminAuthPage from "./Components/Admin/auth";
import AdminProfile from "./Components/Admin/AdminProfile";

function App() {
  return (
    <div>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/create" element={<CreateMeeting />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/auth" element={<AdminAuthPage></AdminAuthPage>}/>
        <Route path="/admin/profile" element={<AdminProfile></AdminProfile>}/>
      </Routes>
    </div>
  );
}

export default App;
