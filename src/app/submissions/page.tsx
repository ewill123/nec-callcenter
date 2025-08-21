"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { FiFolder, FiX, FiDownload } from "react-icons/fi";
import { FaMale, FaFemale } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { CSVLink } from "react-csv"; // npm i react-csv
import { Tooltip } from "react-tooltip"; // npm i react-tooltip

type Incident = {
  id: string;
  date: string;
  time_of_incident?: string;
  time_of_report?: string;
  caller_name: string;
  caller_mobile: string;
  sex: "male" | "female";
  precinct_name: string;
  location: string;
  precinct_code?: string;
  polling_place_number?: string;
  witness_choice?: string;
  witness_role?: string;
  incident_choice?: string;
  incident_other?: string;
  resolution?: string;
  status?: "pending" | "resolved";
  issue_group?: "Security" | "Technical" | "Other";
};

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Incident | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from("call_center_reports")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      if (data) setSubmissions(data as Incident[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const paginatedSubmissions = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return submissions.slice(start, start + itemsPerPage);
  }, [submissions, page]);

  const groupedByDate = paginatedSubmissions.reduce((acc: Record<string, Incident[]>, curr) => {
    const dateKey = format(new Date(curr.date), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(curr);
    return acc;
  }, {});

  const toggleDate = (date: string) =>
    setExpandedDate(expandedDate === date ? null : date);

  const formatIssue = (text?: string) => {
    if (!text) return "Unknown Problem";
    return text.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSaveResolution = async () => {
    if (!selectedSubmission || !resolutionText)
      return alert("Resolution cannot be empty.");

    const res = await fetch(`/api/reports/${selectedSubmission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution: resolutionText, status: "resolved" }),
    });

    if (res.ok) {
      alert("Resolution saved ✅");
      setSelectedSubmission(null);
      setResolutionText("");
      fetchSubmissions();
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto my-12 p-6">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-900">My Submissions</h1>

      {/* Export CSV */}
      <div className="flex mb-6">
        <CSVLink
          data={submissions}
          filename={"incident_reports.csv"}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
        >
          <FiDownload /> Export CSV
        </CSVLink>
      </div>

      {loading ? (
        <p className="text-gray-600 text-lg">Loading...</p>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <p className="text-gray-600 text-lg">No submissions found.</p>
      ) : (
        <>
          {/* Folder Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {Object.entries(groupedByDate).map(([date, reports]) => (
                <motion.div
                  key={date}
                  className="bg-blue-50 shadow-lg rounded-lg cursor-pointer hover:shadow-2xl transition p-6 flex flex-col items-center justify-center relative"
                  onClick={() => toggleDate(date)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <FiFolder className="text-blue-600 w-16 h-16 mb-3" />
                  <h2 className="font-bold text-xl text-gray-900">{format(new Date(date), "dd MMM yyyy")}</h2>
                  <span className="text-gray-700 font-medium mt-1">{reports.length} reports</span>
                  <span className="absolute top-2 right-2 text-sm text-gray-500">{reports.filter(r => r.status === "pending").length} pending</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Expanded Date View */}
          {expandedDate && !selectedSubmission && (
            <div className="fixed inset-0 bg-gray-50 z-50 overflow-auto p-10">
              <button
                onClick={() => setExpandedDate(null)}
                className="absolute top-6 right-6 text-gray-700 hover:text-gray-900 text-xl flex items-center gap-2"
              >
                <FiX size={28} /> Close
              </button>

              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                {format(new Date(expandedDate), "dd MMM yyyy")} - {groupedByDate[expandedDate].length} reports
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <AnimatePresence>
                  {groupedByDate[expandedDate].map(sub => (
                    <motion.div
                      key={sub.id}
                      className={`p-4 rounded-lg shadow-lg cursor-pointer relative flex flex-col items-center justify-center ${
                        sub.sex === "male" ? "bg-blue-100" : "bg-pink-100"
                      } border-l-4 ${
                        sub.issue_group === "Security" ? "border-red-500" :
                        sub.issue_group === "Technical" ? "border-yellow-500" :
                        "border-gray-400"
                      }`}
                      onClick={() => setSelectedSubmission(sub)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      whileHover={{ scale: 1.04, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
                      data-tooltip-id={`tooltip-${sub.id}`}
                      data-tooltip-content={`${formatIssue(sub.incident_choice || sub.incident_other)} | ${sub.precinct_name}`}
                    >
                      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3 text-center bg-white shadow">
                        {sub.sex === "male" ? <FaMale className="text-blue-600 w-10 h-10" /> : <FaFemale className="text-pink-600 w-10 h-10" />}
                      </div>
                      <p className="font-bold text-gray-900 text-center text-base">{sub.caller_name}</p>
                      <p className="font-semibold text-gray-700 mt-1 text-center text-sm">{formatIssue(sub.incident_choice || sub.incident_other)}</p>
                      <span className={`absolute top-2 left-2 px-2 py-1 text-xs rounded font-semibold ${
                        sub.status === "pending" ? "bg-yellow-400 text-gray-800" : "bg-green-500 text-white"
                      }`}>{sub.status?.toUpperCase()}</span>

                      {sub.status && sub.status === "pending" && (
                        <button
                          className="mt-3 px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmission(sub);
                            setResolutionText(sub.resolution || "");
                          }}
                        >
                          Quick Resolve
                        </button>
                      )}

                      <Tooltip id={`tooltip-${sub.id}`} place="top" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {submissions.length > itemsPerPage && (
                <div className="flex justify-center mt-6 gap-4">
                  {Array.from({ length: Math.ceil(submissions.length / itemsPerPage) }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded ${page === i+1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                      onClick={() => setPage(i+1)}
                    >
                      {i+1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Submission Modal */}
          <AnimatePresence>
            {selectedSubmission && (
              <motion.div
                className="fixed inset-0 bg-gray-50 z-50 overflow-auto p-10 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="absolute top-6 right-6 text-gray-700 hover:text-gray-900 text-xl flex items-center gap-2"
                >
                  <FiX size={28} /> Close
                </button>

                <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">NEC Incident Report</h1>

                <div className="space-y-6 max-w-5xl w-full text-gray-900">
                  {[
                    { title: "General Information", keys: ["date","time_of_incident","time_of_report","caller_name","caller_mobile","sex"] },
                    { title: "Location", keys: ["precinct_name","precinct_code","polling_place_number","location"] },
                    { title: "Witness", keys: ["witness_choice","witness_role"] },
                    { title: "Incident Details", keys: ["incident_choice","incident_other","resolution"] },
                  ].map((section, idx) => (
                    <div key={idx} className="border p-6 rounded-lg shadow-sm">
                      <h2 className="font-bold text-2xl mb-3 border-b pb-2">{section.title}</h2>
                      {section.keys.map(key => (
                        <p key={key} className="text-sm">
                          <span className="font-semibold">{key.replace(/_/g," ").toUpperCase()}:</span>{" "}
                          {selectedSubmission[key as keyof Incident] || "-"}
                        </p>
                      ))}
                    </div>
                  ))}

                  {selectedSubmission.status === "pending" && (
                    <div className="mt-6">
                      <textarea
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        placeholder="Enter resolution here..."
                        className="w-full border rounded p-4 focus:ring-2 focus:ring-sky-400 text-sm"
                      />
                      <button
                        onClick={handleSaveResolution}
                        className="mt-4 px-6 py-3 bg-sky-500 text-white rounded hover:bg-sky-600 text-sm font-semibold"
                      >
                        Save Resolution
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
