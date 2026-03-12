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

export const getIncidentByIdService = async (id) => {
  const incident = await Incident.findById(id).populate(
    "reportedBy",
    "name email",
  );
  return incident;
};

export const upvoteAndValidate = async (incidentId, userId) => {
  const incident = await Incident.findById(incidentId);
  if (!incident) return null;
  const alreadyUpvoted = incident.upvotedBy.includes(userId);

  if (alreadyUpvoted) {
    return await Incident.findOneAndUpdate(
      incidentId,
      {
        $inc: { upvotes: -1 },
        $pull: { upvotedBy: userId },
      },
      { new: true },
    ).populate("reportedBy", "name email");
  } else {
    return await Incident.findOneAndUpdate(
      incidentId,
      {
        $inc: { upvotes: +1 },
        $addToSet: { upvotedBy: userId },
      },
      { new: true },
    ).populate("reportedBy", "name email");
  }
};
