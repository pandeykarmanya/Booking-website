import mongoose, {Schema} from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    adminRequest: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
    },

    refreshToken: { type: String }
},
{
    timestamps: true
});

export const User = mongoose.model('User', userSchema);