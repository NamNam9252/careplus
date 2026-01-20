import mongoose, { Schema, model, models } from "mongoose";

export interface IPatient {
    _id?: string;
    name: string;
    email: string;
    role: "patient";
}

const PatientSchema = new Schema<IPatient>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { type: String, default: "patient" },
    },
    { timestamps: true }
);

export default models.Patient || model<IPatient>("Patient", PatientSchema);
