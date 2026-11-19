// components/Header.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LogoIcon from './LogoIcon';
import CustomSwitch from './CustomSwitch';
import { useAppContext } from '../contexts/AppContext';
import BookingCountdown from './BookingCountDown';
import DebugSettings from './DebugSettings';
import { useModalContext } from '../contexts/ModalContext';
import { validateBookingForm } from '../utils';
import BookingPlanSummary from './BookingPlanSummary';
import BookingHistoryDrawer, { useBookingRuns } from './BookingHistory';
import BuildInfoChip from './BuildInfo';

// Text button on wide screens, icon with a tooltip when space is short.
function HeaderAction({ icon, label, onClick, iconOnly, small }) {
  if (iconOnly) {
    return (
      <Tooltip title={label} arrow>
        <IconButton color="primary" size={small ? 'small' : 'medium'} aria-label={label} onClick={onClick}>
          {icon}
        </IconButton>
      </Tooltip>
    );
  }
  return (
    <Button color="primary" startIcon={icon} onClick={onClick} sx={{ whiteSpace: 'nowrap', px: 1.25 }}>
      {label}
    </Button>
  );
}

HeaderAction.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  iconOnly: PropTypes.bool,
  small: PropTypes.bool,
};

const Header = () => {
  const { formData, toggleAutomation } = useAppContext();
  const { openModal } = useModalContext();
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isNarrow = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [historyOpen, setHistoryOpen] = useState(false);
  const runs = useBookingRuns();

  const handleAutomationToggle = () => {
    if (!formData.automationStatus) {
      const validationErrors = validateBookingForm(formData, { forAutomation: true });

      if (validationErrors.length > 0) {
        openModal(
          'error',
          'Cannot Start Automation',
          validationErrors[0]
        );
        return;
      }
    }

    if (formData.automationStatus) {
      toggleAutomation();
      return;
    }

    openModal(
      'automation',
      'Start Auto Booking?',
      <BookingPlanSummary formData={formData} />,
      toggleAutomation
    );
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        backgroundColor: '#fff',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 1.25 }}>
        <Stack direction="row" alignItems="center" flexWrap="wrap" columnGap={2} rowGap={1}>
          {/* Brand */}
          <Stack direction="row" alignItems="center" gap={1.25} sx={{ mr: 'auto', minWidth: 0 }}>
            <LogoIcon height={isPhone ? 32 : 40} />
            <Typography
              component="h1"
              noWrap
              sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.3rem' }, color: '#12134F' }}
            >
              Tatkal Ticket Booking
            </Typography>
            <BuildInfoChip />
          </Stack>

          {/* Help, history and debug */}
          <Stack direction="row" alignItems="center" gap={isPhone ? 0 : 0.5}>
            <HeaderAction
              icon={<HelpOutlineRoundedIcon />}
              label="How to Use"
              iconOnly={isNarrow}
              small={isPhone}
              onClick={() => window.open('/how-to-use.html', '_blank')}
            />
            <HeaderAction
              icon={(
                <Badge badgeContent={runs.length} color="secondary" max={9}>
                  <HistoryRoundedIcon />
                </Badge>
              )}
              label="Booking History"
              iconOnly={isNarrow}
              small={isPhone}
              onClick={() => setHistoryOpen(true)}
            />
            <Box sx={{ ml: isPhone ? 0 : 1 }}>
              <DebugSettings label={isNarrow ? 'Debug' : 'Debug Mode'} iconOnly={isPhone} />
            </Box>
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ my: 0.5, display: { xs: 'none', md: 'block' } }} />

          {/* Booking status and the main switch */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <BookingCountdown compact={isPhone} />
            <CustomSwitch
              checked={formData.automationStatus}
              onChange={handleAutomationToggle}
              name='automationStatus'
            />
          </Stack>
        </Stack>
      </Container>
      <BookingHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} runs={runs} />
    </Box>
  );
};

export default Header;
