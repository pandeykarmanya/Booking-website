import mongoose, {Schema} from "mongoose";

const venueScehma = new mongoose.Scehma({
    name: {
        type: String,
        required: true
    },
},
{
    timestamps: true
});

export const Venue = mongoose.model('Venue', venueScehma);