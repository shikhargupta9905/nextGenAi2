import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { ServerUrl } from "../App";

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/dashboard/interviews",
          {
            withCredentials: true,
          }
        );

        console.log(result.data);

        setInterviews(result.data.interviews || []);
      } catch (error) {
        console.log(error);
        setInterviews([]);
      }
    };

    getMyInterviews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 w-full flex items-start gap-4 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition text-gray-600"
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Interview History
            </h1>

            <p className="text-gray-500 mt-2">
              Track your past interviews and performance reports
            </p>
          </div>
        </div>

        {/* No interviews */}
        {interviews.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            <p className="text-gray-500">
              No interviews found. Start your first interview.
            </p>
          </div>
        ) : (
          /* Interview list */
          <div className="grid gap-3">
            {interviews.map((item, index) => (
              <div
                key={item._id || item.id || index}
                onClick={() => navigate(`/report/${item.id || item._id}`)}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Interview details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.role || item.jobRole || "Interview"}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      {item.experience || 0} years ·{" "}
                      {item.mode || "N/A"}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(
                        item.createdAt || item.createAt || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-600">
                      {item.finalScore || item.score || 0}/10
                    </p>

                    <p className="text-sm font-medium text-gray-500">
                      Overall Score
                    </p>
                  </div>

                  {/* Status */}
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-medium ${
                      item.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status || "completed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewHistory;