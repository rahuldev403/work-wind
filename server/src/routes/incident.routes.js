import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  createIncident,
  getAllIncidents,
  getIncidentById,
  upvoteIncidentById,
} from "../controller/incident.controller.js";

const incidentRoute = express.Router();

incidentRoute.post("/", requireAuth, createIncident);
incidentRoute.get("/", requireAuth, getAllIncidents);
incidentRoute.get("/:id", requireAuth, getIncidentById);
incidentRoute.patch("/:id/upvote", requireAuth, upvoteIncidentById);
export default incidentRoute;
