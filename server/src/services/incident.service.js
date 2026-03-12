import Incident from "../models/incident.model.js";

export const createIncidentService = async (incidentData) => {
  const incident = await Incident.create(incidentData);
  return incident;
};

export const getAllIncidentsService = async (
  filterObj,
  limitNum,
  skip,
  sortBy,
) => {
  const allIncidents = await Incident.find(filterObj)
    .populate("reportedBy", "name email")
    .sort(sortBy || "-createdAt")
    .skip(skip)
    .limit(limitNum);

  const totalCount = await Incident.countDocuments(filterObj);
  return { incidents: allIncidents, totalCount };
};
