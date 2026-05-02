import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: ['pending', 'joined'], default: 'pending' },
    joinedAt: { type: Date }
  }]
}, { timestamps: true });

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
