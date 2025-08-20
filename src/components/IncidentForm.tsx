"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

// ================= Zod Schema =================
const schema = z
  .object({
    date: z.string().min(1, "Date is required"),
    time_of_incident: z.string().optional(),
    time_of_report: z.string().optional(),
    caller_name: z.string().min(1, "Caller name is required"),
    caller_mobile: z.string().regex(/^\+?\d{7,15}$/, "Invalid phone number"),
    sex: z.enum(["Male", "Female", "Other"], { message: "Sex is required" }),
    precinct_name: z.string().min(1, "Precinct name required"),
    location: z.string().min(1, "Location required"),
    precinct_code: z.string().optional(),
    polling_place_number: z.string().optional(),

    witness_choice: z
      .enum(["incident_witnessed", "arrived_after", "party_to_incident"])
      .optional(),
    witness_role: z.string().optional(),

    incident_choice: z
      .enum([
        "polling_not_open",
        "materials_not_arrived",
        "missing_on_roll",
        "no_security",
        "tension_unrest",
        "campaigning",
        "hate_speech",
        "overcrowding",
      ])
      .optional(),
    incident_other: z.string().optional(),
    resolution: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.witness_choice && !data.witness_role?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Caller role required if witness selected",
        path: ["witness_role"],
      });
    }
  });

// ================= TypeScript Type =================
type FormData = z.infer<typeof schema>;

// ================= Incident Form Component =================
export default function IncidentForm() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      sex: "Male",
    },
  });

  const witnessChoice = watch("witness_choice");
  const incidentChoice = watch("incident_choice");
  const [timeRecorded, setTimeRecorded] = useState(false);

  // Auto-record Time of Report when user starts typing
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!timeRecorded && name && name !== "time_of_report") {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5); // HH:MM
        setValue("time_of_report", timeString);
        setTimeRecorded(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, timeRecorded]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Incident submitted ✅");
        reset();
        setTimeRecorded(false);
      } else {
        const err = await res.json();
        alert("Submit failed: " + err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Unexpected error occurred");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto my-8 p-6 rounded-2xl bg-white shadow-lg border border-gray-200 space-y-6"
    >
      {/* Logo */}
      <div className="text-center">
        <img
          src="/images/nec-logo.png"
          alt="NEC Logo"
          className="h-16 mx-auto mb-2"
        />

        <h1 className="text-2xl font-bold text-gray-900">
          Digital Call Center Log
        </h1>
      </div>

      {/* Header Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ["date", "Date", "date"],
          ["time_of_incident", "Time of Incident", "time"],
          ["time_of_report", "Time of Report", "time"],
          ["caller_name", "Caller Name", "text"],
          ["caller_mobile", "Caller Mobile", "text"],
        ].map(([field, label, type]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type={type as string}
              {...register(field as keyof FormData)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:ring-2 focus:ring-sky-400"
            />
            {errors[field as keyof FormData] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[field as keyof FormData]?.message as string}
              </p>
            )}
          </div>
        ))}

        {/* Sex */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sex</label>
          <select
            {...register("sex")}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:ring-2 focus:ring-sky-400"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      {/* Precinct & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ["precinct_name", "Precinct Name"],
          ["location", "Location of Incident"],
          ["precinct_code", "Precinct Code"],
          ["polling_place_number", "Polling Place Number"],
        ].map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              {...register(field as keyof FormData)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:ring-2 focus:ring-sky-400"
            />
            {errors[field as keyof FormData] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[field as keyof FormData]?.message as string}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Witness Section */}
      <fieldset className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <legend className="text-lg font-semibold text-gray-900">Witness</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          {[
            ["incident_witnessed", "Incident witnessed by Caller"],
            ["arrived_after", "Caller arrived after incident"],
            ["party_to_incident", "Caller is party to incident"],
          ].map(([val, label]) => (
            <label
              key={val}
              className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition
                ${
                  witnessChoice === val
                    ? "bg-sky-100 border-sky-400"
                    : "bg-white border-gray-300"
                }
                hover:bg-sky-50`}
            >
              <input
                type="radio"
                value={val}
                {...register("witness_choice")}
                className="accent-sky-500"
              />
              <span className="text-gray-900 font-medium">{label}</span>
            </label>
          ))}
        </div>

        {witnessChoice && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Caller Role
            </label>
            <input
              {...register("witness_role")}
              placeholder="Poll worker / Supervisor / NEC staff / Voter"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:ring-2 focus:ring-sky-400"
            />
            {errors.witness_role && (
              <p className="text-red-500 text-xs mt-1">
                {errors.witness_role.message}
              </p>
            )}
          </div>
        )}
      </fieldset>

      {/* Incident Section */}
      <fieldset className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <legend className="text-lg font-semibold text-gray-900">
          Type of Incident
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {[
            ["polling_not_open", "Polling place is not open"],
            ["materials_not_arrived", "Polling materials have not arrived"],
            ["missing_on_roll", "People cannot be located on the FRR"],
            ["no_security", "No Security"],
            ["tension_unrest", "Tension / Unrest / Intimidation"],
            ["campaigning", "Campaigning at Center"],
            ["hate_speech", "Hate Speech / Violence"],
            ["overcrowding", "Overcrowding"],
          ].map(([val, label]) => (
            <label
              key={val}
              className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition
                ${
                  incidentChoice === val
                    ? "bg-sky-100 border-sky-400"
                    : "bg-white border-gray-300"
                }
                hover:bg-sky-50`}
            >
              <input
                type="radio"
                value={val}
                {...register("incident_choice")}
                className="accent-sky-500"
              />
              <span className="text-gray-900 font-medium">{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700">
            Others (please explain)
          </label>
          <textarea
            {...register("incident_other")}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:ring-2 focus:ring-sky-400 min-h-[80px]"
          />
        </div>
      </fieldset>

      {/* Resolution */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          How was the situation resolved?
        </label>
        <textarea
          {...register("resolution")}
          className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:ring-2 focus:ring-sky-400 min-h-[100px]"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-lg font-semibold text-white bg-sky-500 hover:bg-sky-600 transition disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}
