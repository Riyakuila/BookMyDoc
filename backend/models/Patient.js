const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
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
    dateOfBirth: {
        type: Date,
        required: true
    },
    sex: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Others']
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
    address: {
        type: String,
        required: true,
        trim: true
    },
    profileImage: {
        type: String,
        default: ''
    }
},{
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;