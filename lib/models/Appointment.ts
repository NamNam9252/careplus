import mongoose, { Schema, model, models } from "mongoose";

export interface IAppointment {
  _id?: string;
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  
  // Time Interfaces
  requestedStartTime: Date; // UTC
  requestedEndTime: Date;   // UTC
  approvedStartTime?: Date; // UTC (Set on accept)
  approvedEndTime?: Date;   // UTC (Set on accept)
  
  status: "requested" | "accepted" | "rejected" | "cancelled" | "completed";
  
  // Meeting Details (Only present if accepted)
  meetingLink?: string;
  googleEventId?: string;
  
  // Context
  reason?: string;      // Patient's note
  doctorNote?: string;  // Doctor's note (e.g., reason for rejection)
  patientNote?: string; // Additional info
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    
    requestedStartTime: { type: Date, required: true },
    requestedEndTime: { type: Date, required: true },
    approvedStartTime: { type: Date },
    approvedEndTime: { type: Date },
    
    status: { 
      type: String, 
      enum: ["requested", "accepted", "rejected", "cancelled", "completed"], 
      default: "requested" 
    },
    
    meetingLink: { type: String },
    googleEventId: { type: String },
    
    reason: { type: String },
    doctorNote: { type: String },
    patientNote: { type: String },
  },
  { timestamps: true }
);

// Indexing for faster lookups
AppointmentSchema.index({ doctor: 1, status: 1, requestedStartTime: 1 });

export default models.Appointment || model<IAppointment>("Appointment", AppointmentSchema);
