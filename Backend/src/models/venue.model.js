import mongoose, {Schema} from "mongoose";

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
},
{
    timestamps: true
});

export const Venue = mongoose.model('Venue', venueSchema);