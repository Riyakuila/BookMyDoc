const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const authMiddleware = require('../middleware/authMiddlewares');
const roleMiddleware = require('../middleware/roleMiddleware');


router.post('/signup', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            dateOfBirth,
            sex,
            phNumber,
            address,
            specialization,
            qualification,
            hospital,
            yearOfExperience,
            consultationFee,
            about,
            languages,
            availableDays,
            availableSlots
        } = req.body;

        if (!['Patient', 'Doctor'].includes(role)) {
            return res.status(400).json({
                message: 'Role must be Patient or Doctor'
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        if (role === 'Patient') {
            const patient = await Patient.create({
                user: user._id,
                name,
                dateOfBirth,
                sex,
                email,
                phNumber,
                address
            });

            return res.status(201).json({
                message: 'Patient signup successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                patient
            });
        }

        if (role === 'Doctor') {
            const doctor = await Doctor.create({
                user: user._id,
                name,
                email,
                phNumber,
                specialization,
                qualification,
                hospital,
                yearOfExperience,
                consultationFee,
                about,
                languages,
                availableDays,
                availableSlots
            });

            return res.status(201).json({
                message: 'Doctor signup successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                doctor
            });
        }

    } catch (error) {
        res.status(500).json({
            message: 'Failed to signup',
            error: error.message
        });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.status(200).json({
            message: 'Signin successfully',
            token
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to signin',
            error: error.message
        });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.status(200).json({
            message: 'Current user fetched successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch current user',
            error: error.message
        });
    }
});

router.get('/:id', authMiddleware, async(req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if(!user){
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.status(200).json({
            message: 'User fetched successfully',
            user
        });
    } catch (error) {
        res.status(400).json({
            messgae: 'Invalid user id',
            error: error.message
        });
    }
});

router.put('/:id', authMiddleware, async(req, res) => {
    try {
        const {name, email} = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');
        if(!user){
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.status(200).json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        res.status(400).json({
            messgae: 'Invalid user id',
            error: error.message
        });
    }
});


module.exports = router;

