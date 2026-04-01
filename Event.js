const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Event description is required']
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    time: {
        type: String,
        required: [true, 'Event time is required']
    },
    location: {
        type: String,
        required: [true, 'Event location is required']
    },
    category: {
        type: String,
        required: [true, 'Event category is required'],
        enum: ['conference', 'seminar', 'workshop', 'party', 'other']
    },
    capacity: {
        type: Number,
        required: [true, 'Event capacity is required']
    },
    price: {
        type: Number,
        default: 0
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema); 