const express = require('express');
const router = express.Router();

const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const authMiddleware = require('../middleware/authMiddlewares');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', async(req, res) => {
    try {
        const appointments = await Appointment.find().populate('patient').populate('doctor');
        res.status(200).json({
            message: 'Appointments fetched successfully',
            appointments
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch appointments',
            error: error.message
        });
    }
});

router.post('/', authMiddleware, async(req,res) => {
    try {
        const {
            doctor,
            date,
            timeslot,
            reason,
            appointmentType,
            patientNotes
        } = req.body;

        const existingPatient = await Patient.findOne({
            user: req.user.id
        });

        if (!existingPatient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        const existingDoctor = await Doctor.findById(doctor);
        if(!existingDoctor){
            return res.status(404).json({
                message: 'Doctor not found'
            });
        }

        if(!existingDoctor.isAvailable){
            return res.status(400).json({
                message: 'Doctor is currently unavailable'
            });
        }

        const appointmentDate = new Date(date);

        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).json({
                message: 'Invalid appointment date'
            });
        }

        const today = new Date();

        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
            return res.status(400).json({
                message: 'Appointment date cannot be in the past'
            });
        }

        const dayName = appointmentDate.toLocaleDateString('en-US', {
            weekday: 'long'
        });

        if (!existingDoctor.availableDays.includes(dayName)) {
            return res.status(400).json({
                message: `Doctor is not available on ${dayName}`
            });
        }

        if (!existingDoctor.availableSlots.includes(timeslot)) {
            return res.status(400).json({
                message: 'Selected time slot is not available for this doctor'
            });
        }

        const existingAppointment = await Appointment.findOne({
            doctor,
            date,
            timeslot,
            appointmentStatus: {
                $nin: ['Cancelled', 'Rejected']
            }
        });

        if(existingAppointment){
            return res.status(409).json({
                message: 'This time slot is already booked.'
            });
        }

        const appointment = await Appointment.create({
            patient: existingPatient._id,
            doctor,
            date,
            timeslot,
            reason,
            appointmentType,
            consultationFee: existingDoctor.consultationFee,
            patientNotes
        });
        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment
        });
    } catch (error) {
        res.status(400).json({
            message: 'Failed to book appointment',
            error: error.message
        });
    }
});

router.get('/my', authMiddleware, async (req, res) => {
    try {
        const patient = await Patient.findOne({
            user: req.user.id
        });

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        const appointments = await Appointment.find({
            patient: patient._id
        })
        .populate('doctor');

        res.status(200).json({
            message: 'My appointments fetched successfully',
            appointments
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch appointments',
            error: error.message
        });
    }
});

router.get('/doctor', authMiddleware, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            });
        }

        const appointments = await Appointment.find({
            doctor: doctor._id
        })
        .populate('patient');

        res.status(200).json({
            message: 'Doctor appointments fetched successfully',
            appointments
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch doctor appointments',
            error: error.message
        });
    }
});

router.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const { cancellationReason } = req.body;

        const patient = await Patient.findOne({
            user: req.user.id
        });

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patient: patient._id
        });

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found for this patient'
            });
        }

        if (['Completed', 'Rejected', 'Cancelled'].includes(appointment.appointmentStatus)) {
            return res.status(400).json({
                message: `Appointment cannot be cancelled because it is already ${appointment.appointmentStatus}`
            });
        }

        appointment.appointmentStatus = 'Cancelled';
        appointment.cancellationReason = cancellationReason || '';

        await appointment.save();

        res.status(200).json({
            message: 'Appointment cancelled successfully',
            appointment
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to cancel appointment',
            error: error.message
        });
    }
});

router.get('/:id', async(req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate('patient').populate('doctor');
        if(!appointment){
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }
        res.status(200).json({
            message: 'Appointment details',
            appointment
        });
    } catch (error) {
        res.status(400).json({
            message: 'Invalid appointment id',
            error: error.message
        });
    }
});


router.put('/:id/status', authMiddleware, roleMiddleware('Doctor'), async (req, res) => {
    try {
        const { appointmentStatus } = req.body;

        const allowedStatuses = [
            'Confirmed',
            'Rejected',
            'Completed'
        ];

        if (!allowedStatuses.includes(appointmentStatus)) {
            return res.status(400).json({
                message: 'Invalid appointment status'
            });
        }

        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctor: doctor._id
        });

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found for this doctor'
            });
        }

        if (
            appointmentStatus === 'Confirmed' &&
            appointment.appointmentStatus !== 'Pending'
        ) {
            return res.status(400).json({
                message: 'Only pending appointments can be confirmed'
            });
        }

        if (
            appointmentStatus === 'Rejected' &&
            appointment.appointmentStatus !== 'Pending'
        ) {
            return res.status(400).json({
                message: 'Only pending appointments can be rejected'
            });
        }

        if (
            appointmentStatus === 'Completed' &&
            appointment.appointmentStatus !== 'Confirmed'
        ) {
            return res.status(400).json({
                message: 'Only confirmed appointments can be completed'
            });
        }

        appointment.appointmentStatus = appointmentStatus;

        await appointment.save();

        res.status(200).json({
            message: 'Appointment status updated successfully',
            appointment
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to update appointment status',
            error: error.message
        });
    }
});

router.delete('/:id', async(req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if(!appointment){
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }
        res.status(200).json({
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            message: 'Invalid appointment id',
            error: error.message
        });
    }
});

module.exports = router;
