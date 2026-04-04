import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

import connectDB from './db/db.js';
import app from './app.js'; 

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);

connectDB()
.then(() => {
    app.listen(process.env.PORT || 5001)
    console.log(`Server is running on port ${process.env.PORT}`);
})

.catch((error) => {
    console.log("MONGO-DB CONNECTION FAILED", error);
});


