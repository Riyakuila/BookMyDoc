const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeslot: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        trim: true
    },
    appointmentType: {
        type: String,
        enum:['In-Person', 'Video Consultation'],
        default:'In-Person'
    },
    appointmentStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed',  'Cancelled', 'Rejected'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    consultationFee: {
        type: Number,
        required: true
    },
    patientNotes: {
        type: String,
        trim: true
    },
    cancellationReason: {
        type: String,
        trim: true
    }
},{
    timestamps: true
}
);

appointmentSchema.index(
    {doctor: 1, date: 1, timeslot: 1},
    {
        unique: true,
        partialFilterExpression: {
            appointmentStatus:{
                $in: ['Pending', 'Confirmed', 'Completed']
            }
        }
    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;