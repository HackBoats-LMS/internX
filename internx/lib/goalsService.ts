import dbConnect from '@/lib/mongodb';
import GoalConfig from '@/models/GoalConfig';

export const DEFAULT_GOAL_OPTIONS: string[] = ['Startup', 'Upper Gradation', 'Job'];

let inMemoryGoals: string[] = [...DEFAULT_GOAL_OPTIONS];

export async function getGoalOptions(): Promise<string[]> {
  try {
    await dbConnect();
    let config = await GoalConfig.findOne({ key: 'global_goals' }).lean();
    if (!config || !config.options || config.options.length === 0) {
      const created = await GoalConfig.create({
        key: 'global_goals',
        options: DEFAULT_GOAL_OPTIONS.map((g) => ({ label: g, value: g })),
      });
      inMemoryGoals = created.options.map((o: any) => o.value);
      return inMemoryGoals;
    }
    inMemoryGoals = config.options.map((o: any) => o.value || o.label);
    return inMemoryGoals;
  } catch (error) {
    console.warn('getGoalOptions MongoDB error, falling back to memory:', (error as any)?.message);
    return inMemoryGoals;
  }
}

export async function setGoalOptions(options: string[]): Promise<string[]> {
  const sanitized = Array.from(
    new Set(
      options
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.toLowerCase() !== 'other' && s.toLowerCase() !== 'others')
    )
  );

  inMemoryGoals = sanitized.length > 0 ? sanitized : [...DEFAULT_GOAL_OPTIONS];

  try {
    await dbConnect();
    const updated = await GoalConfig.findOneAndUpdate(
      { key: 'global_goals' },
      {
        key: 'global_goals',
        options: inMemoryGoals.map((g) => ({ label: g, value: g })),
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    ).lean();

    if (updated?.options) {
      return updated.options.map((o: any) => o.value || o.label);
    }
  } catch (error) {
    console.warn('setGoalOptions MongoDB error, saved in memory:', (error as any)?.message);
  }

  return inMemoryGoals;
}

