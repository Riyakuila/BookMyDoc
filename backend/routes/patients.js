const express = require('express');
const router = express.Router();

const Patient = require('../models/Patient');

const authMiddleware = require('../middleware/authMiddlewares');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', async(req, res) => {
    try{
        const patients = await Patient.find();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch patients',
            error: error.message
        });
    }
});

router.get('/me', authMiddleware, roleMiddleware('Patient'), async (req, res) => {
    try {
        const patient = await Patient.findOne({
            user: req.user.id
        });

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        res.status(200).json({
            message: 'Patient profile fetched successfully',
            patient
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch patient profile',
            error: error.message
        });
    }
});

router.put('/me', authMiddleware, roleMiddleware('Patient'), async (req, res) => {
    try {
        const {
            name,
            dateOfBirth,
            sex,
            phNumber,
            address,
            profileImage
        } = req.body;

        const patient = await Patient.findOne({
            user: req.user.id
        });

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        if (name !== undefined) patient.name = name;
        if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
        if (sex !== undefined) patient.sex = sex;
        if (phNumber !== undefined) patient.phNumber = phNumber;
        if (address !== undefined) patient.address = address;
        if (profileImage !== undefined) patient.profileImage = profileImage;

        await patient.save();

        res.status(200).json({
            message: 'Patient profile updated successfully',
            patient
        });

    } catch (error) {
        res.status(400).json({
            message: 'Failed to update patient profile',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if(!patient){
            return res.status(404).json({
                message: 'Patient not found',
                error: error.message
            });
        }
        res.status(200).json(patient);
    } catch (error) {
        res.status(400).json({
            message: 'Invalid patient id',
            error: error.message
        });
    }
});

module.exports = router;