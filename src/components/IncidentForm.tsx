"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ================= Zod Schema =================
const schema = z.object({
  date: z.string().min(1, "Date is required"),
  caller_name: z.string().min(1, "Caller name is required"),
  caller_mobile: z.string().min(3, "Mobile is required"),
  sex: z.enum(["Male", "Female", "Other"], {
    required_error: "Sex is required",
  }),
  precinct_name: z.string().min(1),
  location: z.string().min(1),
  precinct_code: z.string().optional(),
  polling_place_number: z.string().optional(),
  time_of_incident: z.string().optional(),
  time_of_report: z.string().optional(),

  witness_incident_witnessed: z.boolean(),
  witness_arrived_after: z.boolean(),
  witness_party_to_incident: z.boolean(),
  witness_role: z.string().optional(),

  incident_polling_not_open: z.boolean(),
  incident_materials_not_arrived: z.boolean(),
  incident_missing_on_roll: z.boolean(),
  incident_no_security: z.boolean(),
  incident_tension_unrest: z.boolean(),
  incident_campaigning_at_center: z.boolean(),
  incident_hate_speech_violence: z.boolean(),
  incident_overcrowding: z.boolean(),

  incident_other: z.string().optional(),
  resolution: z.string().optional(),
});

// ================= TypeScript Type =================
type FormData = z.infer<typeof schema>;

// ================= Incident Form Component =================
export default function IncidentForm() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      sex: "Male",
      witness_incident_witnessed: false,
      witness_arrived_after: false,
      witness_party_to_incident: false,
      incident_polling_not_open: false,
      incident_materials_not_arrived: false,
      incident_missing_on_roll: false,
      incident_no_security: false,
      incident_tension_unrest: false,
      incident_campaigning_at_center: false,
      incident_hate_speech_violence: false,
      incident_overcrowding: false,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Incident submitted ✅");
        reset();
      } else {
        const err = await res.json();
        alert("Submit failed: " + err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Unexpected error occurred");
    }
  };

  const witnessChecked =
    watch("witness_incident_witnessed") ||
    watch("witness_arrived_after") ||
    watch("witness_party_to_incident");

  // ================= STYLES =================
  const inputStyle: React.CSSProperties = {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #ccc",
    width: "100%",
    marginTop: "6px",
    backgroundColor: "#fff",
    color: "#111",
    fontSize: "15px",
    outline: "none",
    transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
    fontSize: "15px",
    color: "#111",
  };

  const errorStyle: React.CSSProperties = {
    color: "#d32f2f",
    fontSize: "13px",
    marginTop: "4px",
  };

  const fieldsetStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "25px",
    backgroundColor: "#f5f5f5",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  const legendStyle: React.CSSProperties = {
    padding: "0 10px",
    fontWeight: 700,
    fontSize: "16px",
    color: "#333",
  };

  const checkboxLabelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    marginBottom: "10px",
    color: "#111",
    cursor: "pointer",
    position: "relative",
  };

  const checkboxStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    borderRadius: "6px",
    border: "2px solid #ccc",
    accentColor: "#4bb2d6",
    cursor: "pointer",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#4bb2d6",
    color: "#fff",
    fontWeight: 600,
    padding: "14px 24px",
    border: "none",
    borderRadius: "12px",
    cursor: isSubmitting ? "not-allowed" : "pointer",
    fontSize: "16px",
    marginTop: "16px",
    width: "100%",
    transition: "background-color 0.2s ease",
  };

  const formStyle: React.CSSProperties = {
    maxWidth: "1100px",
    margin: "40px auto",
    padding: "40px",
    borderRadius: "18px",
    backgroundColor: "#e0f7ff",
    boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
      {/* NEC Logo */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <img
          src="/nec-logo.png"
          alt="NEC Logo"
          style={{ height: "90px", objectFit: "contain" }}
        />
      </div>

      <h1
        style={{
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "30px",
          textAlign: "center",
          color: "#111",
        }}
      >
        NEC Call Center Log
      </h1>

      {/* Header Fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <label style={labelStyle}>
          Date
          <input type="date" {...register("date")} style={inputStyle} />
          {errors.date && <span style={errorStyle}>{errors.date.message}</span>}
        </label>

        <label style={labelStyle}>
          Caller Name
          <input
            {...register("caller_name")}
            style={inputStyle}
            placeholder="Full name"
          />
          {errors.caller_name && (
            <span style={errorStyle}>{errors.caller_name.message}</span>
          )}
        </label>

        <label style={labelStyle}>
          Caller Mobile
          <input
            {...register("caller_mobile")}
            style={inputStyle}
            placeholder="+231..."
          />
          {errors.caller_mobile && (
            <span style={errorStyle}>{errors.caller_mobile.message}</span>
          )}
        </label>

        <label style={labelStyle}>
          Sex
          <select {...register("sex")} style={inputStyle}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.sex && <span style={errorStyle}>{errors.sex.message}</span>}
        </label>

        <label style={labelStyle}>
          Precinct Name
          <input {...register("precinct_name")} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          Location of Incident
          <input {...register("location")} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          Precinct Code
          <input {...register("precinct_code")} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          Polling Place Number
          <input {...register("polling_place_number")} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          Time of Incident
          <input {...register("time_of_incident")} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          Time of Report
          <input {...register("time_of_report")} style={inputStyle} />
        </label>
      </div>

      {/* Witness Fieldset */}
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Witness</legend>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
          }}
        >
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              {...register("witness_incident_witnessed")}
              style={checkboxStyle}
            />
            Incident witnessed by Caller
          </label>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              {...register("witness_arrived_after")}
              style={checkboxStyle}
            />
            Caller arrived after incident
          </label>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              {...register("witness_party_to_incident")}
              style={checkboxStyle}
            />
            Caller is party to incident
          </label>
        </div>

        {witnessChecked && (
          <label style={{ ...labelStyle, marginTop: "16px" }}>
            Caller Role
            <input
              {...register("witness_role")}
              style={inputStyle}
              placeholder="Poll worker / Supervisor / NEC staff / Voter"
            />
          </label>
        )}
      </fieldset>

      {/* Type of Incident Fieldset */}
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Type of Incident</legend>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          {[
            ["incident_polling_not_open", "Polling place is not open"],
            [
              "incident_materials_not_arrived",
              "Polling materials have not yet arrived",
            ],
            ["incident_missing_on_roll", "People cannot be located on the FRR"],
            ["incident_no_security", "No Security"],
            [
              "incident_tension_unrest",
              "Tension / Unrest / Intimidation / Harassment",
            ],
            ["incident_campaigning_at_center", "Campaigning at Center"],
            ["incident_hate_speech_violence", "Hate Speech / Violence"],
            ["incident_overcrowding", "Overcrowding"],
          ].map(([field, labelText]) => (
            <label key={field} style={checkboxLabelStyle}>
              <input
                type="checkbox"
                {...register(field as keyof FormData)}
                style={checkboxStyle}
              />
              {labelText}
            </label>
          ))}
        </div>

        <label style={{ ...labelStyle, marginTop: "16px" }}>
          Others (please explain)
          <textarea
            {...register("incident_other")}
            style={{ ...inputStyle, minHeight: "100px" }}
          />
        </label>
      </fieldset>

      {/* Resolution */}
      <label style={labelStyle}>
        How was the situation resolved?
        <textarea
          {...register("resolution")}
          style={{ ...inputStyle, minHeight: "120px" }}
        />
      </label>

      <button type="submit" style={buttonStyle} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}
