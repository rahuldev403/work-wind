import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiRersponse.js";
import ApiError from "../utils/ApiError.js";
import {
  createIncidentService,
  getAllIncidentsService,
  getIncidentByIdService,
  upvoteAndValidate,
} from "../services/incident.service.js";
import mongoose from "mongoose";
import { emitIncidentNearby } from "../sockets/socket.js";
import { categorizeIncidentDescription } from "../services/ai.service.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const shouldCategorizeDescription = (description) => {
  if (typeof description !== "string") {
    return false;
  }

  const normalizedDescription = description.trim();

  return (
    normalizedDescription.length >= 10 && /[a-zA-Z]/.test(normalizedDescription)
  );
};

export const createIncident = asyncHandler(async (req, res) => {
  const { title, description, location, media } = req.body;
  const user = req.user;
  const normalizedDescription =
    typeof description === "string" ? description.trim() : description;

  if (!user) {
    throw new ApiError(401, "Authentication required");
  }
  if (!title || !normalizedDescription || !location) {
    throw new ApiError(400, "Title, description, and location are required");
  }

  if (!location.coordinates || location.coordinates.length !== 2) {
    throw new ApiError(
      400,
      "Location must have valid coordinates [longitude, latitude]",
    );
  }

  const aiResult = shouldCategorizeDescription(normalizedDescription)
    ? await categorizeIncidentDescription(normalizedDescription)
    : {
        type: "other",
        severity: "low",
        summary: normalizedDescription,
      };

  const incidentData = {
    title,
    description: normalizedDescription,
    location: {
      type: "Point",
      coordinates: location.coordinates,
    },
    type: aiResult.type,
    severity: aiResult.severity,
    summary: aiResult.summary,
    reportedBy: user._id,
    media: media || null,
  };

  const incident = await createIncidentService(incidentData);
  try {
    emitIncidentNearby(incident);
  } catch (error) {
    console.error("incident emit failed", error);
  }
  return res
    .status(201)
    .json(new ApiResponse(201, incident, "Incident created successfully"));
});

const allowedSeverity = ["low", "medium", "high"];

export const getAllIncidents = asyncHandler(async (req, res) => {
  const user = req.user;
  const { page = 1, limit = 10, severity, type, sortBy } = req.query;
  if (!user?._id) {
    throw new ApiError(401, "User Authentication required");
  }
  if (severity && !allowedSeverity.includes(severity)) {
    throw new ApiError(400, "Invalid severity type");
  }
  const pageNum = Number.isInteger(Number(page))
    ? Math.max(1, Number(page))
    : 1;
  const limitNum = Number.isInteger(Number(limit))
    ? Math.min(100, Math.max(1, Number(limit)))
    : 10;
  const skip = limitNum * (pageNum - 1);
  const filterObj = {};
  if (severity) filterObj.severity = severity;
  if (type) filterObj.type = type;
  const result = await getAllIncidentsService(
    filterObj,
    limitNum,
    skip,
    sortBy,
  );
  const totalPages = Math.ceil(result.totalCount / limitNum);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        incidents: result.incidents,
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalIncidents: result.totalCount,
          limit: limitNum,
        },
      },
      "Incidents fetched successfully",
    ),
  );
});

export const getIncidentById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Not a valid id");
  }
  const incidentById = await getIncidentByIdService(id);

  if (incidentById === null || incidentById === undefined) {
    throw new ApiError(404, "Incident not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, incidentById, "Incident fetched successfully"));
});

export const upvoteIncidentById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const userId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Not a valid id");
  }
  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }
  const result = await upvoteAndValidate(id, userId);

  if (!result) {
    throw new ApiError(404, "Incident not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Activity successful"));
});

export const uploadMedia = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Authentication required");
  }

  if (!req.files || !req.files.file) {
    throw new ApiError(400, "No file provided");
  }

  const file = req.files.file;
  const maxSize = 100 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new ApiError(400, "File size exceeds 100MB limit");
  }

  const mimeType = file.mimetype;
  let resourceType = "auto";

  if (mimeType.startsWith("image/")) {
    resourceType = "image";
  } else if (mimeType.startsWith("video/")) {
    resourceType = "video";
  }

  const mediaUrl = await uploadToCloudinary(file.data, file.name, resourceType);

  return res
    .status(200)
    .json(new ApiResponse(200, { mediaUrl }, "File uploaded successfully"));
});
