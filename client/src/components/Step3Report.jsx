import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaArrowLeft } from "react-icons/fa";

function Step3Report({ report }) {
    const navigate = useNavigate();

    const score = Number(report?.score ?? report?.finalScore ?? 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate("/")}
                    className="mb-6 p-3 rounded-full bg-white shadow text-gray-600"
                    aria-label="Back to home"
                >
                    <FaArrowLeft />
                </button>

                <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">
                                Interview Complete
                            </p>
                            <h1 className="text-3xl font-bold text-gray-800 mt-2">
                                Your AI Interview Report
                            </h1>
                            <p className="text-gray-500 mt-2">
                                Review your performance and use the feedback to improve.
                            </p>
                        </div>
                        <div className="text-center bg-emerald-50 px-8 py-5 rounded-2xl">
                            <p className="text-sm text-gray-500">Overall Score</p>
                            <p className="text-4xl font-bold text-emerald-600">{score}/100</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Summary</h2>
                        <p className="text-gray-600 leading-7">
                            {report?.report || "No summary was generated."}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Recommendation</h2>
                        <p className="text-gray-600 leading-7">
                            {report?.recommendation || "Keep practicing and review the question-wise feedback."}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Strengths</h2>
                        {report?.strengths?.length ? (
                            <ul className="space-y-2">
                                {report.strengths.map((item, index) => (
                                    <li key={index} className="text-gray-600">• {item}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No strengths were returned.</p>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Areas to Improve</h2>
                        {report?.weaknesses?.length ? (
                            <ul className="space-y-2">
                                {report.weaknesses.map((item, index) => (
                                    <li key={index} className="text-gray-600">• {item}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No improvement areas were returned.</p>
                        )}
                    </div>
                </div>

                {report?.questions?.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Question-wise Performance</h2>
                        {report.questions.map((question, index) => (
                            <div key={question._id || index} className="bg-white rounded-2xl shadow-md p-6">
                                <div className="flex gap-3">
                                    <FaCheckCircle className="text-emerald-500 mt-1" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">Question {index + 1}</h3>
                                        <p className="text-gray-700 mt-2">{question.question}</p>
                                        {question.answer && (
                                            <p className="text-gray-600 mt-3 whitespace-pre-line">
                                                <strong>Your answer:</strong> {question.answer}
                                            </p>
                                        )}
                                        {question.feedback && (
                                            <p className="text-gray-600 mt-3 whitespace-pre-line">
                                                <strong>Feedback:</strong> {question.feedback}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate("/interview")}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                    >
                        Start Another Interview
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Step3Report;
