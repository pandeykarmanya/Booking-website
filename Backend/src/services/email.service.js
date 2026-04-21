import { createTransporter } from '../config/email.config.js';
import { bookingConfirmationEmail, bookingCancellationEmail } from '../utils/emailTemplates.js';

export const sendBookingConfirmation = async (booking, user) => {
    try {
        const transporter = createTransporter();
        const emailContent = bookingConfirmationEmail(booking, user);

        const mailOptions = {
            from: `"Venue Booking System" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent to:', user.email);
        console.log('Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

export const sendBookingCancellation = async (booking, user) => {
    try {
        const transporter = createTransporter();
        const emailContent = bookingCancellationEmail(booking, user);

        const mailOptions = {
            from: `"Venue Booking System" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Cancellation email sent to:', user.email);
        console.log('Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};