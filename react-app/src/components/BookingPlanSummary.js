import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  formatDateTimeInIST,
  getLoginDateTime,
  getScheduledDateTime,
} from '../utils';

const SummaryRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.75 }}>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
      {value || '-'}
    </Typography>
  </Box>
);

SummaryRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

function BookingPlanSummary({ formData }) {
  const scheduledDateTime = getScheduledDateTime(formData.scheduleDate, formData.targetTime);
  const wakeUpDateTime = getLoginDateTime(
    formData.scheduleDate,
    formData.targetTime,
    formData.loginMinutesBefore
  );
  const wakeUpTimePassed = wakeUpDateTime && wakeUpDateTime.getTime() <= Date.now();
  const selectedPassengers = (formData.passengerList || []).filter(
    (passenger) => passenger?.isSelected
  );
  const selectedMasterPassengers = (formData.passengerNames || []).filter(
    (passenger) => passenger?.isSelected
  );

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
        Review the details that will be saved and used for automation.
      </Typography>

      <SummaryRow label="Train" value={formData.trainNumber} />
      <SummaryRow label="Route" value={`${formData.from || '-'} -> ${formData.to || '-'}`} />
      <SummaryRow label="Journey date" value={formData.dateString} />
      <SummaryRow label="Quota" value={formData.quotaType} />
      <SummaryRow label="Class" value={formData.accommodationClass} />

      {formData.quotaType === 'GENERAL' && (
        <SummaryRow
          label="Opening day"
          value={formData.isOpeningDayBooking ? 'Enabled' : 'Not enabled'}
        />
      )}

      <Divider sx={{ my: 1 }} />

      {wakeUpTimePassed ? (
        <>
          <SummaryRow label="Mode" value="Manual continuation" />
          <SummaryRow
            label="Scheduled time"
            value={scheduledDateTime ? `${formatDateTimeInIST(scheduledDateTime)} has passed` : '-'}
          />
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Automation will continue when you open IRCTC manually.
          </Typography>
        </>
      ) : (
        <>
          <SummaryRow
            label="Booking start"
            value={scheduledDateTime ? formatDateTimeInIST(scheduledDateTime) : '-'}
          />
          <SummaryRow
            label="Automation wake-up"
            value={wakeUpDateTime ? formatDateTimeInIST(wakeUpDateTime) : '-'}
          />
          <SummaryRow label="Login before" value={`${formData.loginMinutesBefore} min`} />
        </>
      )}
      <SummaryRow label="Refresh interval" value={`${formData.refreshTime} ms`} />

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Passengers to use
      </Typography>

      {formData.masterData ? (
        <TableContainer sx={{ maxHeight: 180 }}>
          <Table size="small" aria-label="selected master passengers">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>IRCTC Master First Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedMasterPassengers.map((passenger) => (
                <TableRow key={passenger.id}>
                  <TableCell>{passenger.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer sx={{ maxHeight: 180 }}>
          <Table size="small" aria-label="selected passengers">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Berth</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedPassengers.map((passenger) => (
                <TableRow key={passenger.id}>
                  <TableCell>{passenger.name}</TableCell>
                  <TableCell>{passenger.age}</TableCell>
                  <TableCell>{passenger.gender}</TableCell>
                  <TableCell>{passenger.preference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

BookingPlanSummary.propTypes = {
  formData: PropTypes.object.isRequired,
};

export default BookingPlanSummary;
