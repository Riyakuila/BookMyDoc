const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const patientRouter = require('./routes/patients');
const doctorRouter = require('./routes/doctors');
const appointmentRouter = require('./routes/appointments');
const userRouter = require('./routes/auth')

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((error) => {
    console.log("Mongodb connection failed: ", error);
});


app.get('/', (req, res) => {
    res.send('BookMyDoc API is working');
});


app.use('/patients', patientRouter);
app.use('/doctors', doctorRouter);
app.use('/appointments', appointmentRouter);
app.use('/auth', userRouter);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});




    

