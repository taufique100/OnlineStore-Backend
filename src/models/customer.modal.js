import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

export const Customer = mongoose.model('Customer', customerSchema);
