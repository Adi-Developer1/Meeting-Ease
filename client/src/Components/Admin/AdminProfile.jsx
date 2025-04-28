import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Cookies from 'js-cookie';
import axios from 'axios';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.remove('adminToken');
        navigate('/admin/auth');
        toast.success('Logged out successfully!');
    };

    return (
        <nav className="bg-black shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="text-xl font-bold text-yellow-400">Admin Dashboard</div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-yellow-300 hover:text-yellow-500 font-medium transition"
                    >
                        Home
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md transition font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

const AdminProfile = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [meetingSearch, setMeetingSearch] = useState('');
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    useEffect(() => {
        const token = Cookies.get('adminToken');
        if (!token) {
            navigate('/admin/auth');
        }
    }, [navigate]);

    const handleDeleteUser = () => setIsModalOpen(true);
    const handleDeleteMeeting = () => setIsMeetingModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setIsMeetingModalOpen(false);
        setUserEmail('');
        setMeetingSearch('');
        setMeetings([]);
        setSelectedMeeting(null);
    };

    const handleDeleteConfirmation = async () => {
        setLoading(true);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);

        try {
            const { data } = await axios.post(
                'http://localhost:3000/admin/delete-user',
                { userEmail },
                { withCredentials: true, signal: controller.signal }
            );
            toast.success(data?.message || "User deleted successfully!");
        } catch (error) {
            if (axios.isCancel(error)) {
                toast.error('Request timed out. Please try again.');
            } else {
                toast.error(error?.response?.data?.message || 'Error deleting user');
            }
        } finally {
            clearTimeout(timeout);
            setLoading(false);
        }
    };

    const handleSearchMeeting = async (e) => {
        const searchQuery = e.target.value;
        setMeetingSearch(searchQuery);

        if (searchQuery.length >= 3) {
            setLoading(true);
            try {
                const { data } = await axios.post(
                    'http://localhost:3000/admin/suggest-meetings',
                    { query: searchQuery }
                );
                setMeetings(data);
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Error fetching meeting suggestions');
            } finally {
                setLoading(false);
            }
        } else {
            setMeetings([]);
        }
    };

    const handleDeleteSelectedMeeting = async () => {
        if (!selectedMeeting) return;

        setLoading(true);
        try {
            const { data } = await axios.post(
                'http://localhost:3000/admin/delete-meeting',
                { meetingId: selectedMeeting._id },
                { withCredentials: true }
            );
            toast.success(data?.message || 'Meeting deleted successfully!');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error deleting meeting');
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    return (
        <div className="bg-black min-h-screen">
            <Navbar />

            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            <div className="flex justify-center items-center py-12">
                <div className="bg-yellow-100 p-8 rounded-2xl shadow-md w-full max-w-lg">
                    <h2 className="text-3xl font-semibold text-black text-center mb-8">
                        Admin Actions
                    </h2>

                    <div className="space-y-6">
                        <button
                            onClick={handleDeleteUser}
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-3 rounded-lg text-lg font-medium transition"
                        >
                            Delete User
                        </button>

                        <button
                            onClick={handleDeleteMeeting}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black py-3 rounded-lg text-lg font-medium transition"
                        >
                            Delete Meeting
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal for Delete User */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-yellow-100 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-2xl font-semibold text-center mb-4 text-black">Delete User</h3>
                        <input
                            type="email"
                            placeholder="Enter User Email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-6"
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={handleDeleteConfirmation}
                                disabled={loading}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-lg font-medium transition disabled:opacity-60"
                            >
                                {loading ? 'Processing...' : 'Confirm'}
                            </button>
                            <button
                                onClick={closeModal}
                                disabled={loading}
                                className="bg-black hover:bg-gray-800 text-yellow-300 px-5 py-2 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Delete Meeting */}
            {isMeetingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-yellow-100 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-2xl font-semibold text-center mb-4 text-black">Delete Meeting</h3>
                        <input
                            type="text"
                            placeholder="Search Meetings..."
                            value={meetingSearch}
                            onChange={handleSearchMeeting}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-6"
                        />

                        {loading && <div className="text-center text-yellow-600">Searching...</div>}

                        {meetings.length > 0 && (
                            <ul className="max-h-48 overflow-y-auto border rounded-md mb-4 bg-white">
                                {meetings.map((meeting) => (
                                    <li
                                        key={meeting._id}
                                        onClick={() => setSelectedMeeting(meeting)}
                                        className="px-4 py-2 hover:bg-yellow-200 cursor-pointer transition"
                                    >
                                        {meeting.title}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {selectedMeeting && (
                            <div className="mt-4 text-center">
                                <p className="mb-2 text-black">
                                    Delete meeting: <strong>{selectedMeeting.title}</strong>?
                                </p>
                                <button
                                    onClick={handleDeleteSelectedMeeting}
                                    disabled={loading}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-lg font-medium transition disabled:opacity-60"
                                >
                                    {loading ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        )}

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={closeModal}
                                disabled={loading}
                                className="bg-black hover:bg-gray-800 text-yellow-300 px-5 py-2 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfile;
