import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import './HowToUse.css'; // If you want to move CSS into a separate file

const HowToUse = () => {
  return (
    <Box className="container mt-5">
      <Typography variant="h2" align="center" className="large font-weight-bold">
        How to Use the Tatkal Ticket Booking Extension
      </Typography>
      
      <Paper className="step-section mt-5 p-4">
        <Typography variant="h4">Fill all the form Login, Train and Payment Details</Typography>
        <ol>
          <li>Fill in your login details. Don&apos;t worry, your information is safe and stored securely in your Chrome local storage.</li>
          <li>Enter the details of the trains you want to book Tatkal tickets for. Use the <code>Go to IRCTC Website</code> button to find the required information and fill in the form.</li>
          <li>We have provided default payment options via Paytm UPI, which is faster than other payment methods.</li>
          <li>If you want to see the final QR code page for payment, check the <code>Pay & Book (Show QR Code Page)</code> box.</li>
          <li><strong>Timer Details:</strong></li>
          <ol>
            <li><code>Tatkal Start Timer</code>:
              <ul>
                <li>For <code>AC class</code>, the Tatkal start timer is set to <code>09:59:53</code>.</li>
                <li>For <code>Sleeper class</code>, it&apos;s set to <code>10:59:53</code>.</li>
              </ul>
            </li>
            <li><code>Refresh Time (ms)</code> is set to 5000ms (5 seconds).</li>
            <li><code>Login Minutes Before</code> is set to 2 minutes by default.</li>
          </ol>
          <li>Click the <code>Save Settings</code> button once all details are filled in.</li>
        </ol>
        <Box className="info p-3">
          <Typography>You can adjust both the start timer and refresh time according to your needs.</Typography>
        </Box>
      </Paper>

      <Paper className="step-section p-4">
        <Typography variant="h4">Auto Booking Switch</Typography>
        <ol>
          <li>If the switch is on, the extension will run automatically on the IRCTC website.</li>
          <li>If the switch is off, it will not run.</li>
        </ol>
      </Paper>

      <Paper className="step-section p-4">
        <Typography variant="h4">How to Add Master Data Passenger</Typography>
        <ol>
          <li>Enter the Passenger First name or the exact name present in the IRCTC master data.</li>
          <li>If there are multiple passengers, separate the names with commas (e.g., <code>Ajay,Rahul</code>).</li>
        </ol>
        <Typography variant="h4">How to Add a New Passenger</Typography>
        <ol>
          <li>Fill in the passenger&apos;s details and click <code>Add Passenger</code>.</li>
        </ol>
        <Box className="warning p-3">
          <Typography>Please check the <code>IRCTC Master Data</code> checkbox to use the master data present in the IRCTC account.</Typography>
        </Box>
      </Paper>

      <Paper className="step-section p-4">
        <Typography variant="h4">What to Do on the IRCTC Site While Booking?</Typography>
        <ol>
          <li>At the login prompt, fill in the captcha and press Enter.</li>
        </ol>
      </Paper>
    </Box>
  );
};

export default HowToUse;
