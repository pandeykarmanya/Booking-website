import dayjs from 'dayjs';

export const bookingConfirmationEmail = (booking, user) => {
    const formattedDate = dayjs(booking.date).format('dddd, MMMM D, YYYY');
    
    return {
        subject: `🎉 Booking Confirmed - ${booking.venue.name}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        background: white;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #7a1c2e 0%, #a52a3a 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                    }
                    .content {
                        padding: 30px;
                    }
                    .booking-details {
                        background: #f9f9f9;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .detail-row {
                        padding: 10px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .label {
                        font-weight: bold;
                        color: #7a1c2e;
                        display: inline-block;
                        width: 150px;
                    }
                    .value {
                        color: #555;
                    }
                    .button {
                        display: inline-block;
                        background: #7a1c2e;
                        color: white !important;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 6px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        color: #666;
                        font-size: 14px;
                        background: #f9f9f9;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Booking Confirmed!</h1>
                        <p>Your venue has been successfully booked</p>
                    </div>
                    
                    <div class="content">
                        <p>Hi <strong>${user ? user.name : 'there'}</strong>,</p>
                        <p>Great news! Your booking has been confirmed. Here are your booking details:</p>
                        
                        <div class="booking-details">
                            <h2 style="margin-top: 0; color: #7a1c2e;">📍 ${booking.venue.name}</h2>
                            
                            <div class="detail-row">
                                <span class="label">📅 Date:</span>
                                <span class="value">${formattedDate}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">🕐 Time:</span>
                                <span class="value">${booking.startTime} - ${booking.endTime}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">📍 Location:</span>
                                <span class="value">${booking.venue.location}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Status:</span>
                                <span class="value" style="color: #22c55e; font-weight: bold;">${booking.status.toUpperCase()}</span>
                            </div>
                        </div>
                        
                        <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                            <strong>⚠️ Important:</strong> Please arrive 10 minutes before your scheduled time.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for choosing our service!</p>
                        <p style="font-size: 12px; color: #999;">
                            This is an automated email. Please do not reply.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

export const bookingCancellationEmail = (booking, user) => {
    const formattedDate = dayjs(booking.date).format('dddd, MMMM D, YYYY');
    
    return {
        subject: `❌ Booking Cancelled - ${booking.venue.name}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        background: white;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #7a1c2e 0%, #a52a3a 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                    }
                    .content {
                        padding: 30px;
                    }
                    .booking-details {
                        background: #f9f9f9;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .detail-row {
                        padding: 10px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .label {
                        font-weight: bold;
                        color: #991b1b;
                        display: inline-block;
                        width: 150px;
                    }
                    .value {
                        color: #555;
                    }
                    .button {
                        display: inline-block;
                        background: #7a1c2e;
                        color: white !important;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 6px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        color: #666;
                        font-size: 14px;
                        background: #f9f9f9;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>❌ Booking Cancelled</h1>
                        <p>Your booking has been cancelled</p>
                    </div>
                    
                    <div class="content">
                        <p>Hi <strong>${user.name}</strong>,</p>
                        <p>This is to confirm that your booking has been cancelled.</p>
                        
                        <div class="booking-details">
                            <h2 style="margin-top: 0; color: #991b1b;">📍 ${booking.venue.name}</h2>
                            
                            <div class="detail-row">
                                <span class="label">📅 Date:</span>
                                <span class="value">${formattedDate}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">🕐 Time:</span>
                                <span class="value">${booking.startTime} - ${booking.endTime}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">📍 Location:</span>
                                <span class="value">${booking.venue.location}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="label">Status:</span>
                                <span class="value" style="color: #dc2626; font-weight: bold;">CANCELLED</span>
                            </div>
                        </div>
                        
                    </div>
                    
                    <div class="footer">
                        <p>We hope to serve you again soon!</p>
                        <p style="font-size: 12px; color: #999;">
                            This is an automated email. Please do not reply.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};