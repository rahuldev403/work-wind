import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    type: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["controllable", "help-needed", "severe"],
      default: "controllable",
      // required: true,
    },
    reportedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    media: {
      type: String,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "Media must be a valid url",
      },
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

incidentSchema.index({ location: "2dsphere" });

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;
