import mongoose, { Document, Model } from 'mongoose'

export interface ITask extends Document {
  title: string
  note: string
  dueDateTime: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'not-started' | 'in-progress' | 'completed'
}

const TaskSchema = new mongoose.Schema<ITask>(
  {
    title:        { type: String, required: true },
    note:         { type: String, required: true },
    dueDateTime:  { type: String, required: true },
    priority:     { type: String, required: true, enum: ['Low','Medium','High'] },
    status:       { type: String, required: true, enum: ['not-started','in-progress','completed'] },
  },
  { timestamps: true }
)

const TaskModel = mongoose.models.Task as Model<ITask> ||
                  mongoose.model<ITask>('Task', TaskSchema)

export default TaskModel
