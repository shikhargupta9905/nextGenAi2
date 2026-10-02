import React, { useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/home.jsx';
import Auth from './pages/Auth.jsx';
import Pricing from './pages/Pricing.jsx';          
import InterviewPage from './pages/InterviewPage.jsx';
import InterviewHistory from './pages/interview.history.jsx';
import InterviewReport from './pages/InterviewReport.jsx'; 

import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice';

export const ServerUrl = "http://localhost:8001";

function App() {

    const dispatch = useDispatch();

    useEffect(() => {
        const getUser = async () => {
            try {
                const result = await axios.get(
                    ServerUrl + "/api/user/current-user",
                    { withCredentials: true }
                );
                dispatch(setUserData(result.data));
            } catch (error) {
                console.log(error);
                dispatch(setUserData(null));
            }
        };
        getUser();
    }, [dispatch]);

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/pricing" element={<Pricing />} />   {/* ⬅️ Yahan add karo */}
        </Routes>
    );
}

export default App;