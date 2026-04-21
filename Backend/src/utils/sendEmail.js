import nodemailer from "nodemailer";

const sendOTPEmail = async (email, otp) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        html: `<h2>Your OTP is: ${otp}</h2>`
    });
};

const sendWelcomeEmail = async (email, name) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Registration Successful 🎉",
        html: `
            <h2>Welcome ${name} 🎉</h2>
            <p>Your account has been successfully verified.</p>
        `
    });
};

export {
    sendOTPEmail,
    sendWelcomeEmail
};