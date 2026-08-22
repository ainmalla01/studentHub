import * as eventsService from "../../services/college/events.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getEvents = asyncHandler(async (req, res) => {
  const EventList = await eventsService.getEvents();
  res.status(200).json(EventList);
});

export const getEventById = asyncHandler(async (req, res) => {
  const eventInfo = await eventsService.getEventById(req.params.id);
  if (!eventInfo) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.status(200).json(eventInfo);
});

export const createEvent = asyncHandler(async (req, res) => {
  const newEvent = await eventsService.createEvent(req.body);
  res.status(201).json(newEvent);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const updatedEvent = await eventsService.updateEvent(req.params.id, req.body);
  if (!updatedEvent) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.status(200).json(updatedEvent);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const deletedEvent = await eventsService.deleteEvent(req.params.id);
  if (!deletedEvent) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.status(200).json({ message: 'Event deleted successfully' });
});

export const getEventParticipants = asyncHandler(async (req, res) => {
  
});


export const getSubmissions = asyncHandler(async (req, res) => {
 
});

export const evaluateSubmission = asyncHandler(async (req, res) => {
 
  });
