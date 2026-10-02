import React, { useState } from 'react'
import { motion } from "motion/react"
import {
    FaUserTie,
    FaBriefcase,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine,
} from "react-icons/fa"
import axios from "axios"
import { ServerUrl } from "../App"
import { useSelector, useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Step1SetUp({ onStart }) {

    const { userData } = useSelector((state) => state.user)
    const dispatch = useDispatch()

    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) {
            console.log("No resume selected");
            return;
        }

        try {
            setAnalyzing(true);
            console.log("Uploading resume...");
            console.log("File:", resumeFile);

            const formdata = new FormData();
            formdata.append("resume", resumeFile);

            const result = await axios.post(
                ServerUrl + "/api/interview/resume",
                formdata,
                { withCredentials: true }
            );

            console.log("Resume analysis response:");
            console.log(result.data);

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setAnalysisDone(true);
        } catch (error) {
            console.log("RESUME ANALYSIS ERROR:");
            console.log(error);
            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Response:", error.response.data);
            }
        } finally {
            setAnalyzing(false);
        }
    };

    const handleStart = async () => {
        setLoading(true);

        try {
            const formData = new FormData();
            
            const numericExperience = experience.replace(/[^0-9.]/g, "");

            formData.append("jobRole", role);
            formData.append("experience", numericExperience || "0");
            formData.append("interviewType", mode);

            if (resumeFile) {
                formData.append("resume", resumeFile);
            }

            const result = await axios.post(
                ServerUrl + "/api/interview/start",
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (userData) {
                dispatch(
                    setUserData({
                        ...userData,
                        credits: result.data.creditsLeft ?? userData.credits
                    })
                );
            }

            setLoading(false);

            // ⬇️ Save interviewId in localStorage
            localStorage.setItem(
                "currentInterviewId", 
                result.data.interviewId || `interview_${Date.now()}`
            );

            // ⬇️ Pass data to InterviewPage
            onStart({
                ...result.data,
                ...result.data.interview,
                interviewId: result.data.interviewId || result.data.interview?.id || localStorage.getItem("currentInterviewId"),
                questions: result.data.questions || result.data.interview?.questions || [],
                userName: result.data.userName || userData?.name || "Candidate"
            });

        } catch (error) {
            console.log(error);
            console.log(
                "SERVER RESPONSE:",
                JSON.stringify(error.response?.data, null, 2)
            );
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4'
        >
            <div className='w-full max-w-4xl bg-white rounded-[24px] shadow-xl grid md:grid-cols-2 overflow-hidden'>

                {/* Left Side */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className='bg-green-50 p-8 flex flex-col justify-center'
                >
                    <h1 className='text-3xl font-bold text-gray-800 mb-5'>
                        Start Your AI Interview
                    </h1>

                    <p className='text-gray-600 text-sm leading-relaxed mb-8 max-w-md'>
                        Practice real interview scenarios powered by AI.
                        Improve communication, technical skills, and confidence.
                    </p>

                    <div className='space-y-4'>
                        <div className='bg-white rounded-xl px-4 py-4 flex items-center gap-4 shadow-sm'>
                            <FaUserTie className='text-green-600' size={18} />
                            <span className='text-gray-700 text-sm font-medium'>
                                Choose Role & Experience
                            </span>
                        </div>

                        <div className='bg-white rounded-xl px-4 py-4 flex items-center gap-4 shadow-sm'>
                            <FaMicrophoneAlt className='text-green-600' size={18} />
                            <span className='text-gray-700 text-sm font-medium'>
                                Smart Voice Interview
                            </span>
                        </div>

                        <div className='bg-white rounded-xl px-4 py-4 flex items-center gap-4 shadow-sm'>
                            <FaChartLine className='text-green-600' size={18} />
                            <span className='text-gray-700 text-sm font-medium'>
                                Performance Analytics
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className='p-8 bg-white'
                >
                    <h2 className='text-3xl font-bold text-gray-800 mb-6'>
                        Interview SetUp
                    </h2>

                    <div className='space-y-5'>

                        {/* Role */}
                        <div className='relative'>
                            <FaUserTie className='absolute top-4 left-4 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Enter role'
                                className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'
                                onChange={(e) => setRole(e.target.value)}
                                value={role}
                            />
                        </div>

                        {/* Experience */}
                        <div className='relative'>
                            <FaBriefcase className='absolute top-4 left-4 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Experience (e.g. 2 years)'
                                className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'
                                onChange={(e) => setExperience(e.target.value)}
                                value={experience}
                            />
                        </div>

                        {/* Interview Type */}
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className='w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'
                        >
                            <option value="Technical">Technical Interview</option>
                            <option value="HR">HR Interview</option>
                        </select>

                        {/* Resume Upload */}
                        {!analysisDone && (
                            <div className='border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-5 text-center'>
                                <input
                                    type='file'
                                    id='resumeUpload'
                                    accept='.pdf'
                                    className='hidden'
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setResumeFile(file);
                                        setAnalysisDone(false);
                                    }}
                                />
                                <label
                                    htmlFor='resumeUpload'
                                    className='cursor-pointer flex flex-col items-center justify-center'
                                >
                                    <FaFileUpload className='text-green-600 mb-2' size={25} />
                                    <p className='text-sm text-gray-700 font-medium'>
                                        {resumeFile
                                            ? resumeFile.name
                                            : "Click to upload resume (PDF, optional)"
                                        }
                                    </p>
                                </label>

                                {resumeFile && (
                                    <motion.button
                                        type='button'
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleUploadResume}
                                        disabled={analyzing}
                                        className='mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-500'
                                    >
                                        {analyzing ? "Analyzing..." : "Analyze Resume"}
                                    </motion.button>
                                )}
                            </div>
                        )}

                        {/* Resume Analysis Result */}
                        {analysisDone && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className='bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4'
                            >
                                <h3 className='text-lg font-semibold text-gray-800'>
                                    Resume Analysis Result
                                </h3>

                                {projects.length > 0 && (
                                    <div>
                                        <p className='font-medium text-gray-700 mb-1'>
                                            Projects:
                                        </p>
                                        <ul className='list-disc list-inside text-gray-600 space-y-1'>
                                            {projects.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {skills.length > 0 && (
                                    <div>
                                        <p className='font-medium text-gray-700 mb-1'>
                                            Skills:
                                        </p>
                                        <div className='flex flex-wrap gap-2'>
                                            {skills.map((s, i) => (
                                                <span
                                                    key={i}
                                                    className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm'
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Start Interview */}
                        <motion.button
                            onClick={handleStart}
                            disabled={!role || !experience || loading}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-full disabled:bg-gray-600 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md'
                        >
                            {loading ? "Starting..." : "Start Interview"}
                        </motion.button>

                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default Step1SetUp