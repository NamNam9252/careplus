import mongoose, { Schema, model, models } from "mongoose";

export interface IDoctor {
  _id?: string;
  name: string;
  email: string;
  role: "doctor";
  experience?: number;
  specializations?: string[];
  isProfileComplete: boolean;
  availability?: {
    days: number[];
    startTime: string;
    endTime: string;
    slotDuration: number;
  };
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "doctor" },
    experience: { type: Number, default: 0 },
    specializations: { type: [String], default: [] },
    isProfileComplete: { type: Boolean, default: false },
    availability: {
      days: { type: [Number], default: [1, 2, 3, 4, 5] }, // Mon-Fri default
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "17:00" },
      slotDuration: { type: Number, default: 30 }
    }
  },
  { timestamps: true }
);

export default models.Doctor || model<IDoctor>("Doctor", DoctorSchema);
