import mongoose, { Schema } from "mongoose";

const data = new Schema({
    name: String,
    score: Number,
    marks: {
        grade: String,
        score: Number
    },
    arr: [{ type: String }],
    created_at: { type: Date, default: null },
    updated_at: { type: Date, default: null }
})

export default mongoose.model('random', data)