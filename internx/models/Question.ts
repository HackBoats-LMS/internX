import mongoose, { Schema, Document } from 'mongoose'

export interface IQuestion extends Document {
    questionText: string
    options: string[]
    correctOption: number
    setName: string
    sectionName: string
    createdAt?: Date
    updatedAt?: Date
}

const QuestionSchema = new Schema<IQuestion>(
    {
        questionText: { type: String, required: true },
        options: [{ type: String }],
        correctOption: { type: Number, required: true, default: 0 },
        setName: { type: String, default: 'Default Set' },
        sectionName: { type: String, default: 'General' },
    },
    {
        timestamps: true,
    }
)

QuestionSchema.index({ setName: 1, sectionName: 1, createdAt: 1 })
QuestionSchema.index({ setName: 1 })

const Question = (mongoose.models.Question as mongoose.Model<IQuestion>) || mongoose.model<IQuestion>('Question', QuestionSchema)

export default Question
