import mongoose, {Schema} from "mongoose";

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'under_maintenance'],
        default: 'available'
    },
    location: {
        type: String,
        default: ""
    },
    capacity: {
        type: Number,
    default: 0
    },
    statusReason: {
        type: String,
        default: ''
    },
    statusUpdatedAt: {
        type: Date
    },
    expectedAvailableDate: {
        type: Date  
    }
},
{
    timestamps: true
});

export const Venue = mongoose.model('Venue', venueSchema);