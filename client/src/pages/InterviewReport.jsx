import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { ServerUrl } from "../App";

function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInterviewReport = async () => {
      try {
        const result = await axios.get(
          `${ServerUrl}/api/interview/report/${id}`,
          {
            withCredentials: true,
          }
        );

        console.log(result.data);
        setReport(result.data.interview || result.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getInterviewReport();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
        <p className="text-gray-500 text-lg">Loading interview report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <p className="text-gray-500 mb-4">
            Interview report not found.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const score = report.score || report.finalScore || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-white shadow hover:shadow-md transition text-gray-600"
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Interview Report
            </h1>

            <p className="text-gray-500 mt-1">
              Review your interview performance and feedback
            </p>
          </div>
        </div>

        {/* Interview Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {report.jobRole || report.role || "Interview"}
              </h2>

              <p className="text-gray-500 mt-2">
                {report.experience || 0} years experience ·{" "}
                {report.interviewType || report.mode || "N/A"}
              </p>
            </div>

            <div className="text-center bg-emerald-50 px-8 py-5 rounded-2xl">
              <p className="text-sm text-gray-500">
                Overall Score
              </p>

              <p className="text-4xl font-bold text-emerald-600">
                {score}/100
              </p>
            </div>

          </div>
        </div>

        {/* AI Report */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            AI Feedback
          </h2>

          <div className="text-gray-600 leading-7 whitespace-pre-line">
            {report.report ||
              report.feedback ||
              "No detailed feedback available."}
          </div>
        </div>

        {/* Questions */}
        {report.questions && report.questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Question-wise Performance
            </h2>

            {report.questions.map((question, index) => (
              <div
                key={question._id || index}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <div className="flex gap-3">
                  <FaCheckCircle className="text-emerald-500 mt-1" />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      Question {index + 1}
                    </h3>

                    <p className="text-gray-700 mt-2">
                      {question.question}
                    </p>

                    {question.answer && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-500">
                          Your Answer
                        </p>

                        <p className="text-gray-600 mt-1 whitespace-pre-line">
                          {question.answer}
                        </p>
                      </div>
                    )}

                    {question.feedback && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-500">
                          Feedback
                        </p>

                        <p className="text-gray-600 mt-1 whitespace-pre-line">
                          {question.feedback}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-3 flex-wrap">
                      {question.difficulty && (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                          {question.difficulty}
                        </span>
                      )}

                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                        Score: {question.score || 0}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/interview-history")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
          >
            Back to Interview History
          </button>
        </div>

      </div>
    </div>
  );
}

export default InterviewReport;