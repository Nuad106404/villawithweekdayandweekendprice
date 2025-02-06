import nodemailer from 'nodemailer';
import { format } from 'date-fns';

// Create transporter with Gmail settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    accessToken: process.env.GMAIL_ACCESS_TOKEN
  }
});

// Alternative transporter using simple authentication
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

export const sendBookingConfirmationEmail = async (booking) => {
  const { customerInfo, bookingDetails, _id: bookingId } = booking;

  if (!customerInfo || !bookingDetails) {
    throw new Error('Invalid booking data: missing customerInfo or bookingDetails');
  }

  try {
    // Try alternative transporter if OAuth2 fails
    const emailTransporter = process.env.GMAIL_CLIENT_ID ? transporter : createTransporter();

    // Format dates
    const formattedCheckIn = format(new Date(bookingDetails.checkIn), 'PPP');
    const formattedCheckOut = format(new Date(bookingDetails.checkOut), 'PPP');

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: customerInfo.email,
      subject: 'Your Single Villa Booking Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Single Villa</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #1a1a1a;">Booking Confirmation</h2>
            <p>Dear ${customerInfo.firstName} ${customerInfo.lastName},</p>
            
            <p>Thank you for choosing Single Villa. We're delighted to confirm your booking.</p>
            
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #4a5568; margin-top: 0;">Booking Information</h3>
              <p><strong>Booking Reference:</strong> ${bookingId}</p>
              <p><strong>Check-in:</strong> ${formattedCheckIn}</p>
              <p><strong>Check-out:</strong> ${formattedCheckOut}</p>
              <p><strong>Number of Rooms:</strong> ${bookingDetails.rooms}</p>
              <p><strong>Total Amount:</strong> THB ${bookingDetails.totalPrice.toLocaleString()}</p>
            </div>

            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #4a5568; margin-top: 0;">Guest Information</h3>
              <p><strong>Name:</strong> ${customerInfo.firstName} ${customerInfo.lastName}</p>
              <p><strong>Email:</strong> ${customerInfo.email}</p>
              <p><strong>Phone:</strong> ${customerInfo.phone}</p>
            </div>

            <div style="margin-top: 20px;">
              <h3 style="color: #4a5568;">Important Information</h3>
              <ul style="padding-left: 20px; color: #4a5568;">
                <li>Check-in time: 2:00 PM</li>
                <li>Check-out time: 12:00 PM</li>
                <li>Please present your booking reference upon arrival</li>
                <li>Free parking is available on-site</li>
              </ul>
            </div>

            <p style="margin-top: 30px;">If you have any questions or need to modify your booking, please don't hesitate to contact us:</p>
            <p>Email: ${process.env.EMAIL_USERNAME}<br>Phone: +95 9123456789</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
              <p style="color: #666;">Best regards,<br>Single Villa Team</p>
            </div>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `,
    };

    console.log('Attempting to send email to:', customerInfo.email);
    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', {
      error: error.message,
      stack: error.stack,
      booking: {
        id: bookingId,
        customerEmail: customerInfo?.email,
        checkIn: bookingDetails?.checkIn,
        checkOut: bookingDetails?.checkOut
      }
    });
    throw error;
  }
};
