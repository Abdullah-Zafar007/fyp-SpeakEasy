const mongoose = require('mongoose');

const thinfoSchema = mongoose.Schema({
    name:String,
    image:String,
    email: { type: String, required: true },
    specialization: { type: String, default: "General" }, // New field
    experience: { type: Number, default: 0 }, // New field
    rating: { type: Number, default: 0, min: 0, max: 5 } // New field
})

module.exports=mongoose.model("thuser",thinfoSchema);