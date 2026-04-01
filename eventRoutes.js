const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'name email')
            .sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email')
            .populate('attendees', 'name email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create event (protected route - only authenticated users)
router.post('/', auth, async (req, res) => {
    try {
        const event = new Event({
            ...req.body,
            organizer: req.user._id
        });
        const newEvent = await event.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update event (protected route - only event organizer)
router.patch('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        Object.keys(req.body).forEach(key => {
            event[key] = req.body[key];
        });

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete event (protected route - only event organizer)
router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await Event.deleteOne({ _id: req.params.id });
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Register for event (protected route)
router.post('/:id/register', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.attendees.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already registered for this event' });
        }

        if (event.attendees.length >= event.capacity) {
            return res.status(400).json({ message: 'Event is full' });
        }

        event.attendees.push(req.user._id);
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 