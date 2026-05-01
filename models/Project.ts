import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  stages: {
    type: [{
      name: { type: String, required: true },
      order: { type: Number, default: 0 },
      color: { type: String, default: '#6366f1' } // Default indigo
    }],
    default: [
      { name: 'Analysis', order: 1, color: '#f59e0b' },
      { name: 'Development', order: 2, color: '#6366f1' },
      { name: 'Testing', order: 3, color: '#10b981' }
    ]
  }
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
