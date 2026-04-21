import mongoose, {Schema} from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Venue",
        required: true,
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true,
        // Format: "HH:MM" (24-hour format, e.g., "09:00", "14:30")
    },
    endTime: {
        type: String,
        required: true,
        // Format: "HH:MM" (24-hour format, e.g., "10:00", "16:30")
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    }
},
{
    timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ user: 1, date: -1 });
bookingSchema.index({ venue: 1, date: 1 });

// Virtual property to get booking duration in hours
bookingSchema.virtual('duration').get(function() {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    const start = startHour + startMin / 60;
    const end = endHour + endMin / 60;
    return end - start;
});

// Method to check if booking is upcoming
bookingSchema.methods.isUpcoming = function() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return this.date >= now && this.status !== 'cancelled';
};

// Method to check if booking is past
bookingSchema.methods.isPast = function() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return this.date < now;
};

// ✅ NEW: Method to check if booking is currently ongoing
bookingSchema.methods.isOngoing = function() {
    const now = new Date();
    const bookingDate = new Date(this.date);
    
    // Get current time in HH:MM format
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    
    // Check if booking is today
    const isToday = bookingDate.toDateString() === now.toDateString();
    
    // Check if current time is between start and end time
    if (isToday && (this.status === 'confirmed' || this.status === 'pending')) {
        return currentTime >= this.startTime && currentTime < this.endTime;
    }
    
    return false;
};

// ✅ NEW: Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
    // Cannot cancel if already cancelled or completed
    if (this.status === 'cancelled' || this.status === 'completed') {
        return false;
    }
    
    // Cannot cancel if booking is in the past
    if (this.isPast()) {
        return false;
    }
    
    // Cannot cancel if booking is currently ongoing
    if (this.isOngoing()) {
        return false;
    }
    
    return true;
};

// ✅ NEW: Method to get booking display status with styling
bookingSchema.methods.getDisplayStatus = function() {
    if (this.status === 'cancelled') {
        return { text: 'Cancelled', color: '#dc2626', icon: '❌' };
    }
    
    if (this.status === 'completed') {
        return { text: 'Completed', color: '#059669', icon: '✅' };
    }
    
    if (this.isPast()) {
        return { text: 'Past Booking', color: '#6b7280', icon: '📅' };
    }
    
    if (this.isOngoing()) {
        return { text: 'Ongoing', color: '#2563eb', icon: '🔵' };
    }
    
    if (this.status === 'pending' || this.status === 'confirmed') {
        return { text: 'Upcoming', color: '#059669', icon: '✅' };
    }
    
    return { text: this.status, color: '#6b7280', icon: '📋' };
};

// Static method to find conflicting bookings
bookingSchema.statics.findConflicts = async function(venueId, date, startTime, endTime, excludeBookingId = null) {
    const query = {
        venue: venueId,
        date: date,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            // New booking starts during existing booking
            { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
            // New booking ends during existing booking
            { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
            // New booking completely encompasses existing booking
            { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
        ]
    };
    
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }
    
    return await this.find(query);
};

export const Booking = mongoose.model('Booking', bookingSchema);