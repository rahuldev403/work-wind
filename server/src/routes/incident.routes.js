import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  createIncident,
  getAllIncidents,
} from "../controller/incident.controller.js";

const incidentRoute = express.Router();

incidentRoute.post("/", requireAuth, createIncident);
incidentRoute.get("/", requireAuth, getAllIncidents);
export default incidentRoute;
