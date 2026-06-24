import mongoose, { Schema, Document } from 'mongoose'

export interface IDescriptiveAnswer extends Document {
    userId: string
    questionId: mongoose.Types.ObjectId
    examAttemptId: mongoose.Types.ObjectId
    setName: string
    answerText: string
    createdAt?: Date
    updatedAt?: Date
}

const DescriptiveAnswerSchema = new Schema<IDescriptiveAnswer>(
    {
        userId: { type: String, required: true },
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        examAttemptId: { type: Schema.Types.ObjectId, ref: 'ExamAttempt', required: true },
        setName: { type: String, required: true },
        answerText: { type: String, required: true },
    },
    {
        timestamps: true,
    }
)

DescriptiveAnswerSchema.index({ userId: 1, examAttemptId: 1 })
DescriptiveAnswerSchema.index({ examAttemptId: 1 })
DescriptiveAnswerSchema.index({ questionId: 1 })

const DescriptiveAnswer = (mongoose.models.DescriptiveAnswer as mongoose.Model<IDescriptiveAnswer>) || mongoose.model<IDescriptiveAnswer>('DescriptiveAnswer', DescriptiveAnswerSchema)

export default DescriptiveAnswer
