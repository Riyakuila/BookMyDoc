const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phNumber: {
        type: String,
        required: true,
        trim: true
    },
    specialization: {
        type: String,
        required: true,
        trim: true
    },
    qualification: {
        type: String,
        required: true,
        trim: true
    },
    hospital: {
        type: String,
        required: true,
        trim: true
    },
    yearOfExperience: {
        type: Number,
        required: true,
        min: 0
    },
    consultationFee: {
        type: Number,
        required: true,
        min: 0
    },
    about: {
        type: String,
        required: true,
        trim: true
    },
    languages: {
        type: [String],
        required: true
    },
    availableDays: {
        type: [String],
        required: true
    },
    availableSlots: {
        type: [String],
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    profileImage: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;