import mongoose from "mongoose";
import Department from "./Department";

const studentRegistrationSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    whatsappNumber: { type: String, required: true },
    collegeName: { type: String, required: true },
    department: { type: String, required: true },
    goals: { type: String, required: true },

}, { timestamps: true })

export default mongoose.models.StudentRegistration || mongoose.model('StudentRegistration', studentRegistrationSchema)