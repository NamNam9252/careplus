import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IQueueItem {
    patientId: string;
    patientName: string;
    appointmentId?: mongoose.Types.ObjectId;
    position: number;
    joinedAt: Date;
    status: "waiting" | "in-consultation" | "finished";
}

export interface IQueue extends Document {
    clinicId: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    date: Date; // The date this queue is for (e.g., today)
    startTime: Date; // When the clinic started taking patients today
    patients: IQueueItem[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const QueueItemSchema = new Schema<IQueueItem>({
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    position: { type: Number, required: true },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["waiting", "in-consultation", "finished"], default: "waiting" },
});

const QueueSchema = new Schema<IQueue>(
    {
        clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
        date: { type: Date, required: true, index: true },
        startTime: { type: Date, default: Date.now },
        patients: [QueueItemSchema],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Compound index for finding the queue for a clinic on a specific day
QueueSchema.index({ clinicId: 1, date: 1 }, { unique: true });

export default models.Queue || model<IQueue>("Queue", QueueSchema);
