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
      enum: [
        "theft",
        "accident",
        "harassment",
        "damaged-property",
        "suspicious-activity",
        "other",
      ],
      required: true,
    },
    summary: {
      type: String,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
      // required: true,
    },
    reportedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
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
