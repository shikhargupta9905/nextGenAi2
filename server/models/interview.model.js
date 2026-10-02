import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    jobRole: {
      type: String,
      required: true
    },

    experience: {
      type: Number,
      required: true
    },

    interviewType: {
      type: String,
      required: true
    },

    resume: {
      type: String
    },

    resumeText: {
      type: String
    },

    questions: [
      {
        question: {
          type: String
        },

        answer: {
          type: String,
          default: ""
        },

        feedback: {
          type: String,
          default: ""
        },

        score: {
          type: Number,
          default: 0
        }
      }
    ],

    score: {
      type: Number,
      default: 0
    },

    report: {
      type: String,
      default: ""
    },

    strengths: {
      type: [String],
      default: []
    },

    weaknesses: {
      type: [String],
      default: []
    },

    recommendation: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress"
    }
  },
  {
    timestamps: true
  }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;