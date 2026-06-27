require('dotenv').config(); //reads the .env file and load process.env
// console.log('Cloudinary config:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY?.slice(0,4));
const express = require('express');
const cors = require('cors');//allows react to  exprress communication without this browser blocks requests
const connectDB = require('./config/db'); //imports db functions
const errorHandler = require('./middleware/errorHandler');

const app = express();

// console.log("Mongo URI:", process.env.MONGODB_URI);
// console.log("PORT:", process.env.PORT);

connectDB(); //immediately connect db before starting api
//allows only client to access the api
// app.use(cors({
//   origin: process.env.CLIENT_URL,
//   credentials: true,
// }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/" , (req,res) =>{
        res.send("hello world Im here Placemint");
})

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/profile',       require('./routes/profile'));
app.use('/api/jobs',          require('./routes/jobs'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/invitations',   require('./routes/invitations'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));//to check server is alive

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));