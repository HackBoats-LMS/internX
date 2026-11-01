import mongoose from 'mongoose';

export interface IGoalOption {
  id?: string;
  label: string;
  value: string;
}

const GoalOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const GoalConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'global_goals', unique: true },
  options: {
    type: [GoalOptionSchema],
    default: [
      { label: 'Startup', value: 'Startup' },
      { label: 'Upper Gradation', value: 'Upper Gradation' },
      { label: 'Job', value: 'Job' },
    ],
  },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.GoalConfig || mongoose.model('GoalConfig', GoalConfigSchema);

