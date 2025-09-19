import mongoose from 'mongoose';

const { Schema } = mongoose;

// Create the schema
const UserAgentSchema = new Schema(
  {
    userId: { type: String, required: true },
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    agentRole: { type: String, required: true },
    promptTemplate: { type: String, required: true },
    originalPromptTemplate: { type: String },
    customInstructions: { type: String, default: '' },
    voiceId: { type: String, required: true },
    fontStyle: { type: String, required: true },
    textColor: { type: String, required: true },
    selectedSocialMediaAccount: { type: String },
    language: { type: String, default: 'English' },
    frequency: {
      plan: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
      intervalDays: { type: Number, required: true },
      monthlyVideos: { type: Number, required: true },
      credits: { type: Number, required: true },
    },
    schedule: {
      startDate: { type: Date, required: true },
      nextGenerationDate: { type: Date, required: true },
      active: { type: Boolean, default: true },
      pausedUntil: { type: Date, default: null },
      generationHistory: [
        {
          date: { type: Date, required: true },
          generationId: { type: Schema.Types.ObjectId, required: true },
          scriptId: { type: String },
          videoId: { type: String },
          videoUrl: { type: String },
          status: {
            type: String,
            enum: ['pending', 'processing', 'published', 'failed'],
            default: 'pending',
          },
          error: { type: String },
        },
      ],
      upcomingDates: [{ type: Date }],
      scheduledScripts: [
        {
          date: { type: Date, required: true },
          script: { type: String, required: true },
          used: { type: Boolean, default: false },
          generationId: { type: Schema.Types.ObjectId },
          videoUrl: { type: String },
          status: {
            type: String,
            enum: ['pending', 'processing', 'published', 'failed'],
            default: 'pending',
          },
          error: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

// Create a compound index on userId and agentId for faster lookups
UserAgentSchema.index({ userId: 1, agentId: 1 }, { unique: true });

// Create or get the model
const UserAgent = mongoose.models.UserAgent || mongoose.model('UserAgent', UserAgentSchema);

export default UserAgent;
