import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../Navbar';

const AdminAuthPage = () => {
    const [activeForm, setActiveForm] = useState('register');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('adminToken');
        console.log(token);
        if (token) {
            navigate('/admin/profile');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:3000/adminlogin', { email: loginEmail, password: loginPassword }, { withCredentials: true });
            toast.success('Login successful');
            navigate('/admin/profile');
        } catch (error) {
            console.error('Login Error:', error.response ? error.response.data : error.message);
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:3000/adminreg', { email: registerEmail, password: registerPassword, secretKey }, { withCredentials: true });
            toast.success('Registration successful. Now login.');
            setActiveForm('login');
        } catch (error) {
            console.error('Registration Error:', error.response ? error.response.data : error.message);
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-purple-50 p-4">
                <Toaster position="top-center" reverseOrder={false} />
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    
                    {/* Buttons */}
                    <div className="flex justify-center mb-6 gap-4">
                        <button
                            onClick={() => setActiveForm('register')}
                            className={`px-4 py-2 rounded-md font-semibold ${activeForm === 'register' ? 'bg-yellow-400 text-purple-800' : 'bg-gray-200 text-gray-700'} transition`}
                        >
                            Register
                        </button>
                        <button
                            onClick={() => setActiveForm('login')}
                            className={`px-4 py-2 rounded-md font-semibold ${activeForm === 'login' ? 'bg-yellow-400 text-purple-800' : 'bg-gray-200 text-gray-700'} transition`}
                        >
                            Login
                        </button>
                    </div>

                    {/* Forms */}
                    {activeForm === 'register' ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <h2 className="text-2xl font-bold mb-4 text-center text-purple-700">Admin Register</h2>
                            <input
                                type="email"
                                placeholder="Email"
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <input
                                type="text"
                                placeholder="Secret Key"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <button
                                type="submit"
                                className="w-full bg-yellow-400 text-purple-800 py-2 rounded-md hover:bg-yellow-500 transition duration-300 font-bold"
                            >
                                Register
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <h2 className="text-2xl font-bold mb-4 text-center text-purple-700">Admin Login</h2>
                            <input
                                type="email"
                                placeholder="Email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <button
                                type="submit"
                                className="w-full bg-yellow-400 text-purple-800 py-2 rounded-md hover:bg-yellow-500 transition duration-300 font-bold"
                            >
                                Login
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminAuthPage;
