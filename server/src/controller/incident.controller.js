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

export const createIncident = asyncHandler(async (req, res) => {
  const { title, description, location, type, severity, media } = req.body;
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Authentication required");
  }
  if (!title || !description || !location || !type) {
    throw new ApiError(
      400,
      "Title, description, location, and type are required",
    );
  }

  if (!location.coordinates || location.coordinates.length !== 2) {
    throw new ApiError(
      400,
      "Location must have valid coordinates [longitude, latitude]",
    );
  }
  const incidentData = {
    title,
    description,
    location: {
      type: "Point",
      coordinates: location.coordinates,
    },
    type,
    severity: severity || "controllable",
    reportedBy: user._id,
    media: media || null,
  };

  const incident = await createIncidentService(incidentData);
  return res
    .status(201)
    .json(new ApiResponse(201, incident, "Incident created successfully"));
});

const allowedSeverity = ["controllable", "help-needed", "severe"];

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
    pageNum,
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
