import mongoose, { Schema, model, models } from "mongoose";

export interface IDoctor {
  _id?: string;
  name: string;
  email: string;
  role: "doctor";
  experience?: number;
  specializations?: string[];
  phone?: string;
  bio?: string;
  isProfileComplete: boolean;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "doctor" },
    experience: { type: Number, default: 0 },
    specializations: { type: [String], default: [] },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Doctor || model<IDoctor>("Doctor", DoctorSchema);

