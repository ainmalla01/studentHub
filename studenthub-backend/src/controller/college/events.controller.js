import * as eventsService from "../../services/college/events.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/*
|--------------------------------------------------------------------------
| Event Controllers
|--------------------------------------------------------------------------
*/

export const getEvents = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const result = await eventsService.getEvents({
    collegeId,
    query: req.query,
  });

  res.status(200).json({
    success: true,
    data: result.data || result,
    pagination: result.pagination,
  });
});

export const getEventById = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { eventId } = req.params;

  const event = await eventsService.getEventById(collegeId, eventId);

  res.status(200).json({
    success: true,
    data: event,
  });
});

export const createEvent = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const event = await eventsService.createEvent({
    collegeId,
    creatorId: req.user.id,
    data: req.body,
  });

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: event,
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { eventId } = req.params;

  const event = await eventsService.updateEvent({
    collegeId,
    eventId,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: event,
  });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { eventId } = req.params;

  await eventsService.deleteEvent(collegeId, eventId);

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});

export const getEventParticipants = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { eventId } = req.params;

  const participants = await eventsService.getEventParticipants(collegeId, eventId);

  res.status(200).json({
    success: true,
    data: participants,
  });
});

/*
|--------------------------------------------------------------------------
| Submissions & Evaluation Controllers (Added for Frontend match)
|--------------------------------------------------------------------------
*/

export const getSubmissions = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { eventId } = req.params;

  const submissions = await eventsService.getSubmissions({ collegeId, eventId });

  res.status(200).json({
    success: true,
    data: submissions,
  });
});

export const evaluateSubmission = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { submissionId } = req.params;

  const evaluatedSubmission = await eventsService.evaluateSubmission({
    collegeId,
    submissionId,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Submission evaluated successfully",
    data: evaluatedSubmission,
  });
});