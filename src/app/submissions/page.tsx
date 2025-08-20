"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { FiFolder, FiPrinter, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

type Incident = {
  id: string;
  date: string;
  time_of_incident?: string;
  time_of_report?: string;
  caller_name: string;
  caller_mobile: string;
  sex: string;
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
};

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Incident | null>(
    null
  );
  const [resolutionText, setResolutionText] = useState("");

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

  const groupedByDate = submissions.reduce(
    (acc: Record<string, Incident[]>, curr) => {
      const dateKey = format(new Date(curr.date), "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(curr);
      return acc;
    },
    {}
  );

  const toggleDate = (date: string) =>
    setExpandedDate(expandedDate === date ? null : date);

  // ------------------ PRINT FUNCTIONS ------------------

  const printStyles = `
    @page { size: A4; margin: 15mm; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; line-height: 1.5; }
    h1 { text-align: center; font-size: 22px; margin-bottom: 10px; }
    h2 { font-size: 16px; margin-top: 12px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
    .section { margin-bottom: 12px; page-break-inside: avoid; }
    .field { margin-bottom: 6px; }
    .label { font-weight: bold; display: inline-block; width: 160px; }
    .report { page-break-after: always; }
  `;

  const handlePrint = (submission: Incident) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let html = `<html><head><title>Incident Report</title><style>${printStyles}</style></head><body>`;
    html += `<h1>NEC Incident Report</h1>`;

    [
      {
        title: "General Information",
        keys: [
          "date",
          "time_of_incident",
          "time_of_report",
          "caller_name",
          "caller_mobile",
          "sex",
        ],
      },
      {
        title: "Location",
        keys: [
          "precinct_name",
          "precinct_code",
          "polling_place_number",
          "location",
        ],
      },
      { title: "Witness", keys: ["witness_choice", "witness_role"] },
      {
        title: "Incident Details",
        keys: ["incident_choice", "incident_other", "resolution"],
      },
    ].forEach((section) => {
      html += `<div class="section"><h2>${section.title}</h2>`;
      section.keys.forEach((key) => {
        html += `<div class="field"><span class="label">${key
          .replace(/_/g, " ")
          .toUpperCase()}:</span> ${
          submission[key as keyof Incident] || "-"
        }</div>`;
      });
      html += `</div>`;
    });

    html += "</body></html>";
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePowerPrint = (reports: Incident[]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let html = `<html><head><title>Incident Reports</title><style>${printStyles}</style></head><body><h1>NEC Incident Reports</h1>`;

    reports.forEach((sub) => {
      html += `<div class="report">`;
      [
        {
          title: "General Information",
          keys: [
            "date",
            "time_of_incident",
            "time_of_report",
            "caller_name",
            "caller_mobile",
            "sex",
          ],
        },
        {
          title: "Location",
          keys: [
            "precinct_name",
            "precinct_code",
            "polling_place_number",
            "location",
          ],
        },
        { title: "Witness", keys: ["witness_choice", "witness_role"] },
        {
          title: "Incident Details",
          keys: ["incident_choice", "incident_other", "resolution"],
        },
      ].forEach((section) => {
        html += `<div class="section"><h2>${section.title}</h2>`;
        section.keys.forEach((key) => {
          html += `<div class="field"><span class="label">${key
            .replace(/_/g, " ")
            .toUpperCase()}:</span> ${sub[key as keyof Incident] || "-"}</div>`;
        });
        html += `</div>`;
      });
      html += `</div>`;
    });

    html += "</body></html>";
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  // ------------------ SAVE RESOLUTION ------------------

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

  // ------------------ RENDER ------------------

  return (
    <div className="max-w-7xl mx-auto my-10 p-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">My Submissions</h1>

      {loading ? (
        <p className="text-gray-600 text-lg">Loading...</p>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <p className="text-gray-600 text-lg">No submissions found.</p>
      ) : (
        <>
          {/* Folder View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence>
              {Object.entries(groupedByDate).map(([date, reports]) => (
                <motion.div
                  key={date}
                  className="bg-blue-100 shadow-md rounded-lg cursor-pointer hover:shadow-2xl transition p-6 flex flex-col items-center justify-center"
                  onClick={() => toggleDate(date)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <FiFolder className="text-blue-600 w-14 h-14 mb-3" />
                  <h2 className="font-bold text-lg text-gray-900">
                    {format(new Date(date), "dd MMM yyyy")}
                  </h2>
                  <span className="text-gray-700 font-medium mt-1">
                    {reports.length} reports
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Expanded Date View */}
          {expandedDate && !selectedSubmission && (
            <div className="fixed inset-0 bg-gray-50 z-50 overflow-auto p-8">
              <button
                onClick={() => setExpandedDate(null)}
                className="absolute top-6 right-6 text-gray-700 hover:text-gray-900 text-xl flex items-center gap-2"
              >
                <FiX size={24} /> Close
              </button>
              <button
                onClick={() => handlePowerPrint(groupedByDate[expandedDate])}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FiPrinter size={18} /> Print All
              </button>

              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                {format(new Date(expandedDate), "dd MMM yyyy")} -{" "}
                {groupedByDate[expandedDate].length} reports
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {groupedByDate[expandedDate].map((sub) => (
                    <motion.div
                      key={sub.id}
                      className="p-5 border rounded-lg shadow hover:shadow-lg cursor-pointer transition bg-white flex flex-col items-center justify-center"
                      onClick={() => setSelectedSubmission(sub)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-32 h-32 bg-blue-200 rounded-lg flex items-center justify-center mb-3 text-center">
                        <p className="font-semibold text-gray-900">
                          {sub.caller_name}
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm text-center">
                        {sub.incident_choice || "Other"}
                      </p>
                      {sub.status === "pending" && (
                        <button
                          className="mt-2 px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmission(sub);
                            setResolutionText(sub.resolution || "");
                          }}
                        >
                          Add Resolution
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Selected Submission View */}
          <AnimatePresence>
            {selectedSubmission && (
              <motion.div
                className="fixed inset-0 bg-gray-50 z-50 overflow-auto p-8 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="absolute top-6 right-6 text-gray-700 hover:text-gray-900 text-xl flex items-center gap-2"
                >
                  <FiX size={24} /> Close
                </button>
                <button
                  onClick={() => handlePrint(selectedSubmission)}
                  className="absolute top-6 left-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <FiPrinter size={18} /> Print
                </button>

                <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
                  NEC Incident Report
                </h1>

                <div className="space-y-6 max-w-3xl w-full text-gray-900">
                  {[
                    {
                      title: "General Information",
                      keys: [
                        "date",
                        "time_of_incident",
                        "time_of_report",
                        "caller_name",
                        "caller_mobile",
                        "sex",
                      ],
                    },
                    {
                      title: "Location",
                      keys: [
                        "precinct_name",
                        "precinct_code",
                        "polling_place_number",
                        "location",
                      ],
                    },
                    {
                      title: "Witness",
                      keys: ["witness_choice", "witness_role"],
                    },
                    {
                      title: "Incident Details",
                      keys: ["incident_choice", "incident_other", "resolution"],
                    },
                  ].map((section, idx) => (
                    <div key={idx} className="border p-5 rounded-lg shadow-sm">
                      <h2 className="font-bold text-xl mb-2 border-b pb-1">
                        {section.title}
                      </h2>
                      {section.keys.map((key) => (
                        <p key={key}>
                          <span className="font-semibold">
                            {key.replace(/_/g, " ").toUpperCase()}:
                          </span>{" "}
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
                        className="w-full border rounded p-3 focus:ring-2 focus:ring-sky-400"
                      />
                      <button
                        onClick={handleSaveResolution}
                        className="mt-3 px-6 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
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
