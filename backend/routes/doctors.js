const express = require('express');
const router = express.Router();

const Doctor = require('../models/Doctor');

const authMiddleware = require('../middleware/authMiddlewares');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json({
            message: 'Fetched doctors successfully',
            doctors
        });
    } catch (error) {
        res.status(404).json({
            message: 'Doctors not found',
            error: error.message
        });
    }
});

router.put('/availability', authMiddleware, roleMiddleware('Doctor'), async (req, res) => {
    try {
        const {
            availableDays,
            availableSlots,
            isAvailable
        } = req.body;

        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            });
        }

        if (availableDays !== undefined) {
            doctor.availableDays = availableDays;
        }

        if (availableSlots !== undefined) {
            doctor.availableSlots = availableSlots;
        }

        if (isAvailable !== undefined) {
            doctor.isAvailable = isAvailable;
        }

        await doctor.save();

        res.status(200).json({
            message: 'Availability updated successfully',
            doctor
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to update availability',
            error: error.message
        });
    }
});

router.get('/me', authMiddleware, roleMiddleware('Doctor'), async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            });
        }

        res.status(200).json({
            message: 'Doctor profile fetched successfully',
            doctor
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch doctor profile',
            error: error.message
        });
    }
});

router.put('/me', authMiddleware, roleMiddleware('Doctor'), async (req, res) => {
    try {
        const {
            name,
            phNumber,
            specialization,
            qualification,
            hospital,
            yearOfExperience,
            consultationFee,
            about,
            languages,
            profileImage
        } = req.body;

        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            });
        }

        if (name !== undefined) doctor.name = name;
        if (phNumber !== undefined) doctor.phNumber = phNumber;
        if (specialization !== undefined) doctor.specialization = specialization;
        if (qualification !== undefined) doctor.qualification = qualification;
        if (hospital !== undefined) doctor.hospital = hospital;
        if (yearOfExperience !== undefined) doctor.yearOfExperience = yearOfExperience;
        if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
        if (about !== undefined) doctor.about = about;
        if (languages !== undefined) doctor.languages = languages;
        if (profileImage !== undefined) doctor.profileImage = profileImage;

        await doctor.save();

        res.status(200).json({
            message: 'Doctor profile updated successfully',
            doctor
        });

    } catch (error) {
        res.status(400).json({
            message: 'Failed to update doctor profile',
            error: error.message
        });
    }
});

router.get('/:id', async (req,res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if(!doctor){
            return res.status(404).json({
                message: 'Doctor not found'
            });
        }
        res.status(200).json({
            message: 'Doctor fetched successfully',
            doctor
        });
    } catch (error) {
        res.status(400).json({
            message: 'Invalid doctor id',
            error: error.message
        });
    }
});

module.exports = router;