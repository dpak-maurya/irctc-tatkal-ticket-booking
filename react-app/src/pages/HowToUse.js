// The How to Use guide (dist/how-to-use.html). Numbers and labels come from
// the app's own defaults, so the guide changes when they do.
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import ToggleOnRoundedIcon from '@mui/icons-material/ToggleOnRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import LogoIcon from '../components/LogoIcon';
import defaultSettings from '../defaultSettings';
import { getTargetTime } from '../openingTimes';
import { OUTCOMES } from '../bookingHistory';
import {
  ActorLegend,
  Callout,
  CheckRhythm,
  Code,
  IrctcMsg,
  Kbd,
  Mark,
  Section,
  SubHeading,
  Timeline,
  Ui,
} from './guideParts';

const ISSUES_URL = 'https://github.com/dpak-maurya/irctc-tatkal-ticket-booking/issues';

// Mirrors FAST_REFRESH_MS and FAST_REFRESH_WINDOW_MS in chrome-extension/src/scripts/user-script.js.
const FAST_REFRESH_MS = 2000;
const FAST_REFRESH_WINDOW_MS = 15000;

const { loginMinutesBefore, searchSecondsBefore, refreshTime } = defaultSettings;
const OPENS = {
  ac: getTargetTime('TATKAL', '3A', false),
  nonAc: getTargetTime('TATKAL', 'SL', false),
  openingDay: getTargetTime('GENERAL', '3A', true),
};

// '10:00:00' moved by some seconds, as 'HH:MM:SS'.
function shiftTime(time, seconds) {
  const [h, m, s] = time.split(':').map(Number);
  const total = (h * 3600 + m * 60 + s + seconds + 86400) % 86400;
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}

const SECTIONS = [
  { id: 'quick-start', label: 'Quick start' },
  { id: 'how-it-works', label: 'How a booking runs' },
  { id: 'details', label: 'Your details' },
  { id: 'timer', label: 'Timer settings' },
  { id: 'opening-day', label: 'Opening Day Booking' },
  { id: 'auto-booking', label: 'Auto Booking switch' },
  { id: 'passengers', label: 'Passengers' },
  { id: 'before', label: 'Before booking starts' },
  { id: 'on-irctc', label: 'On the IRCTC site' },
  { id: 'history', label: 'Booking History' },
  { id: 'avoid', label: 'Avoid these' },
  { id: 'faq', label: 'Common questions' },
];

// The section being read: the last one whose heading has passed under the top bars.
function useActiveSection() {
  const [active, setActive] = useState(SECTIONS[0].id);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerWidth >= 900 ? 120 : 160;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = SECTIONS[0].id;
      if (atBottom) {
        current = SECTIONS[SECTIONS.length - 1].id;
      } else {
        SECTIONS.forEach(({ id }) => {
          const heading = document.querySelector(`#${id} h2`);
          if (heading && heading.getBoundingClientRect().top <= line) current = id;
        });
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return active;
}

function TopBar() {
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'saturate(180%) blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <LogoIcon height={32} />
        <Typography noWrap sx={{ fontWeight: 700, color: '#12134F', fontSize: { xs: '1rem', sm: '1.1rem' } }}>
          Tatkal Ticket Booking
          {!isPhone && <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}> · Guide</Box>}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button size="small" href="options.html" startIcon={<SettingsRoundedIcon />} sx={{ whiteSpace: 'nowrap' }}>
          {isPhone ? 'Settings' : 'Open settings'}
        </Button>
        {!isPhone && (
          <Button
            size="small"
            variant="outlined"
            href={`${ISSUES_URL}/new`}
            target="_blank"
            rel="noopener"
            startIcon={<GitHubIcon />}
            sx={{ borderRadius: 999, whiteSpace: 'nowrap' }}
          >
            Report a problem
          </Button>
        )}
      </Container>
    </Box>
  );
}

function SideMenu({ active }) {
  return (
    <Box component="nav" aria-label="On this page" sx={{ position: 'sticky', top: 80, pt: 6 }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 1, ml: 1.5 }}>
        On this page
      </Typography>
      {SECTIONS.map(({ id, label }) => {
        const current = id === active;
        return (
          <Link
            key={id}
            href={`#${id}`}
            underline="none"
            aria-current={current ? 'true' : undefined}
            sx={{
              display: 'block',
              py: 0.6,
              px: 1.5,
              fontSize: '0.92rem',
              borderLeft: '2px solid',
              borderColor: current ? 'primary.main' : 'divider',
              color: current ? 'primary.main' : 'text.secondary',
              fontWeight: current ? 700 : 400,
              backgroundColor: current ? 'action.hover' : 'transparent',
              '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' },
            }}
          >
            {label}
          </Link>
        );
      })}
    </Box>
  );
}

function ChipMenu({ active }) {
  useEffect(() => {
    document.getElementById(`chip-${active}`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [active]);

  return (
    <Box
      component="nav"
      aria-label="On this page"
      sx={{
        position: 'sticky',
        top: 50,
        zIndex: 5,
        mx: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 3 },
        py: 1,
        overflowX: 'auto',
        backgroundColor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        scrollbarWidth: 'none',
      }}
    >
      <Stack direction="row" gap={0.75} sx={{ width: 'max-content' }}>
        {SECTIONS.map(({ id, label }) => (
          <Chip
            key={id}
            id={`chip-${id}`}
            label={label}
            component="a"
            href={`#${id}`}
            clickable
            size="small"
            color={id === active ? 'primary' : 'default'}
            variant={id === active ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>
    </Box>
  );
}

SideMenu.propTypes = { active: PropTypes.string.isRequired };
ChipMenu.propTypes = { active: PropTypes.string.isRequired };

function SimpleTable({ head, rows }) {
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  // Phones: one card per row, each value labelled with its column name.
  if (isPhone) {
    return (
      <Stack gap={1} sx={{ my: 2 }}>
        {rows.map((row, index) => (
          <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: '8px' }}>
            <Typography component="div" sx={{ fontWeight: 700, mb: 0.5 }}>{row[0]}</Typography>
            {row.slice(1).map((cell, cellIndex) => (
              <Typography key={cellIndex} component="div" variant="body2" sx={{ mt: 0.25 }}>
                {head.length > 2 && (
                  <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>{head[cellIndex + 1]}: </Box>
                )}
                {cell}
              </Typography>
            ))}
          </Paper>
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', my: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#EEF2FB' }}>
            {head.map((cell) => (
              <TableCell key={cell} sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 1.25 }}>
                {cell}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} sx={{ py: 1.25, verticalAlign: 'top', whiteSpace: cellIndex === 0 ? 'nowrap' : 'normal' }}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

SimpleTable.propTypes = {
  head: PropTypes.arrayOf(PropTypes.string).isRequired,
  rows: PropTypes.arrayOf(PropTypes.array).isRequired,
};

const QUICK_START = [
  { title: 'Login details', body: 'Your IRCTC user ID and password.' },
  { title: 'Train', body: 'Train number, stations, date, quota and class.' },
  { title: 'Passengers', body: 'Add them and tick the ones travelling.' },
  { title: 'Save', body: <>Click <Ui>Save Booking Details</Ui>.</> },
  { title: 'Turn it on', body: <>Switch <Ui>Auto Booking</Ui> ON and keep Chrome open.</> },
];

const TIMELINE = [
  { when: shiftTime(OPENS.ac, -loginMinutesBefore * 60), actor: 'ext', title: 'Opens IRCTC and logs in', body: `${loginMinutesBefore} minutes before booking opens.` },
  { when: 'if asked', actor: 'you', title: 'Captcha, if IRCTC shows one', body: <>Type it and press <Kbd>Enter</Kbd>. Or turn on <Code>Auto Solve</Code>.</> },
  { when: shiftTime(OPENS.ac, -searchSecondsBefore), actor: 'ext', title: 'Searches trains and waits', body: `${searchSecondsBefore} seconds early, while IRCTC is still calm. It waits on the train list.` },
  { when: OPENS.ac, actor: 'ext', highlight: true, title: 'Booking opens: checks seats', body: <>The first seat check goes out right after the opening. It clicks <Ui>Book Now</Ui> as soon as it can.</> },
  { when: '+ few s', actor: 'ext', title: 'Fills passenger details', body: 'Names, ages, berths, food, mobile number and preferences.' },
  { when: '≈ 45 s', actor: 'irctc', title: 'IRCTC holds the page', body: <>About 45 seconds after <Ui>Book Now</Ui>, for every user. Just wait.</> },
  { when: 'review', actor: 'you', title: 'Captcha or Aadhaar OTP, if asked', body: 'Most bookings have neither. The extension waits for you.' },
  { when: 'payment', actor: 'you', title: 'Approve the payment', body: 'The extension picks your payment option. Approve it quickly in your UPI app.' },
  { when: 'result', actor: 'irctc', title: 'Ticket status', body: <>Confirmed, RAC or waitlisted. Saved in <Link href="#history">Booking History</Link>.</> },
];

const CHECKLIST = [
  <>Your IRCTC account is <strong>Aadhaar verified</strong>. Tatkal needs it.</>,
  <>Your <strong>Aadhaar-linked mobile</strong> is nearby. Some trains ask for an OTP.</>,
  <>Your <strong>UPI app</strong> is open and unlocked, ready to approve the payment.</>,
  <>Only <strong>one IRCTC tab</strong> is open, and you&apos;re not logged in on the IRCTC app or another browser.</>,
  <>Your computer&apos;s clock is <strong>set automatically</strong>, and Chrome stays open.</>,
];

const IRCTC_STEPS = [
  {
    title: 'Login',
    body: (
      <Typography>The extension fills in your user ID and password and signs in. If IRCTC shows a captcha, a prompt
        appears: type it and press <Kbd>Enter</Kbd>. Or turn on <Code>Auto Solve</Code> to fill it for you.</Typography>
    ),
  },
  {
    title: 'Train list',
    body: (
      <>
        <Typography>The extension searches trains, waits for booking to open, checks seats for your class and clicks{' '}
          <Ui>Book Now</Ui> as soon as it&apos;s available.</Typography>
        <Callout type="info" title={<>IRCTC says <IrctcMsg>We are experiencing High Load</IrctcMsg></>}>
          Normal at opening time. The extension tries again by itself.
        </Callout>
        <Callout type="error" title="A message that won't go away by trying again">
          For example a wrong date, or <IrctcMsg>Unable to Process Request … Client IP</IrctcMsg>. The extension stops and
          shows you the message. Continue by hand from there. A Client IP block usually clears after a few minutes.
        </Callout>
      </>
    ),
  },
  {
    title: 'Passenger details',
    body: (
      <>
        <Typography>Passengers, mobile number and preferences are filled in, and <Ui>Continue</Ui> is clicked for you.</Typography>
        <Callout type="warning" title="IRCTC keeps loading for about 45 seconds">
          This hold starts at <Ui>Book Now</Ui> and is the same for every user. <Mark>Don&apos;t click Continue again.</Mark>
        </Callout>
      </>
    ),
  },
  {
    title: 'Review journey',
    body: (
      <>
        <Typography>Most bookings have no captcha here now, and the extension clicks <Ui>Continue</Ui>.</Typography>
        <Box component="ul" sx={{ pl: 2.5, mt: 1, '& li': { mb: 0.75 } }}>
          <li><strong>Captcha?</strong> A prompt shows the <strong>Current Seat Availability</strong>. Decide whether to go
            ahead, then type the captcha and press <Kbd>Enter</Kbd>.</li>
          <li><strong>Aadhaar OTP?</strong> Click <Ui>Generate OTP</Ui>, enter the OTP sent to your Aadhaar-linked mobile,
            then click <Ui>Continue</Ui>. The extension waits for you.</li>
        </Box>
      </>
    ),
  },
  {
    title: 'Payment',
    body: (
      <Typography>The extension picks your payment method and provider. <Mark>Approve the payment in your UPI app
        quickly</Mark>: seats are confirmed only after payment completes.</Typography>
    ),
  },
];

const FAQ = [
  {
    q: 'Why does the passenger page load for so long?',
    a: <>IRCTC holds every booking for about 45 seconds after <Ui>Book Now</Ui> before it moves on. Filling the form
      faster doesn&apos;t change it. Just wait, and don&apos;t click Continue again.</>,
  },
  {
    q: `Why does it search ${searchSecondsBefore} seconds before booking opens?`,
    a: 'IRCTC is calm before the opening, so the train list loads quickly. The extension then waits on that page, and its first seat check goes out right after the opening.',
  },
  {
    q: 'IRCTC showed "Client IP". What now?',
    a: 'It is a temporary block from IRCTC. The extension stops and shows the message. Wait a few minutes, then continue by hand. Bookings have gone through after this.',
  },
  {
    q: "The IRCTC page clock and my clock don't match.",
    a: <>The clock on the IRCTC page runs a few seconds fast. The extension uses your computer&apos;s clock, which
      matches IRCTC&apos;s server when <strong>Set time automatically</strong> is on.</>,
  },
  {
    q: 'Where is my data stored?',
    a: "In Chrome's local storage on your computer only. Logs you share leave out personal details.",
  },
];

const HISTORY_OUTCOMES = ['confirmed', 'rac', 'waitlisted', 'reached-payment', 'failed-after-payment', 'failed'];

export default function HowToUse() {
  const active = useActiveSection();
  const isWide = useMediaQuery((theme) => theme.breakpoints.up('md'));

  // A link like how-to-use.html#timer: the page renders after the browser looks
  // for the anchor, so jump to it once it exists.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <>
      <TopBar />
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '220px minmax(0, 1fr)' }, gap: { md: 6 } }}>
          {isWide ? <Box><SideMenu active={active} /></Box> : <ChipMenu active={active} />}

          <Box component="main" sx={{ maxWidth: 800, minWidth: 0, pb: 8, lineHeight: 1.7, '& li': { my: 0.5 } }}>
            {/* Hero */}
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={{ xs: 2, sm: 3 }} alignItems={{ sm: 'center' }} sx={{ pt: { xs: 3, md: 6 } }}>
              <Box
                sx={{
                  flexShrink: 0,
                  width: { xs: 72, sm: 104 },
                  height: { xs: 72, sm: 104 },
                  borderRadius: '14px',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'surface.main',
                  '& svg': { width: '62%', height: 'auto' },
                }}
              >
                <LogoIcon height={64} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'secondary.main', mb: 0.75 }}>
                  How to use
                </Typography>
                <Typography component="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' }, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                  Book Tatkal tickets without the rush
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontSize: '1.1rem', color: 'text.secondary', maxWidth: 680, mt: 2 }}>
              Fill in your details once. When booking opens, the extension logs in, searches, checks seats and fills the
              forms for you. You only enter a captcha or OTP if IRCTC asks, and approve the payment.
            </Typography>

            <Section id="quick-start" icon={<RocketLaunchRoundedIcon />} title="Quick start" subtitle="Five steps, about five minutes. Do this the day before your journey.">
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 1.5 }}>
                {QUICK_START.map((step, index) => (
                  <Paper key={step.title} variant="outlined" sx={{ p: 2, borderRadius: '10px' }}>
                    <Avatar sx={{ width: 30, height: 30, fontSize: '0.95rem', fontWeight: 700, bgcolor: 'primary.main', mb: 1 }}>{index + 1}</Avatar>
                    <Typography sx={{ fontWeight: 700 }}>{step.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{step.body}</Typography>
                  </Paper>
                ))}
              </Box>
              <Callout type="success" title="Tip">The default timer settings work well for most bookings. You usually don&apos;t need to change them.</Callout>
            </Section>

            <Section id="how-it-works" icon={<TimelineRoundedIcon />} title="How a booking runs" subtitle={<>An AC Tatkal booking with the default settings. Booking opens at <Code>{OPENS.ac}</Code>.</>}>
              <ActorLegend />
              <Timeline steps={TIMELINE} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Link href="#opening-day">Opening Day Booking</Link> runs the same way, with booking opening at <Code>{OPENS.openingDay}</Code>.
              </Typography>
            </Section>

            <Section id="details" icon={<EditNoteRoundedIcon />} title="Fill in your details" subtitle="Everything stays in your Chrome on this computer.">
              <SubHeading>🔐 Login details</SubHeading>
              <Typography>Your IRCTC user ID and password, stored in Chrome&apos;s local storage on your computer only.</Typography>

              <SubHeading>🚉 Train details</SubHeading>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <li>Enter the train number, <strong>From</strong> and <strong>To</strong> station codes, journey date, quota and class.
                  The <Ui>Go to IRCTC Website</Ui> button helps you look them up.</li>
                <li>Booking General tickets on the first day they open (60 days ahead)? Turn on <Code>Opening Day Booking</Code>.
                  See <Link href="#opening-day">Opening Day Booking</Link>.</li>
              </Box>
              <Callout type="warning" title="Use the train's own station codes">
                Train 22178 runs to <Code>CSMT</Code>, so search <Code>BSB</Code> → <Code>CSMT</Code>, not <Code>MMCT</Code>.
                Otherwise IRCTC stops to ask you to confirm a different station.
              </Callout>

              <SubHeading>💳 Payment details</SubHeading>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <li>By default the extension pays through <strong>{defaultSettings.paymentType}</strong> with <strong>Paytm UPI</strong>,
                  which is quicker than other methods. You can change it.</li>
                <li>Tick <Ui>Pay &amp; Book (Show QR Code Page)</Ui> if you want the extension to click Pay for you. Leave it off to click Pay yourself.</li>
              </Box>
            </Section>

            <Section id="timer" icon={<TimerRoundedIcon />} title="Timer settings" subtitle="When the extension wakes up and how fast it checks seats.">
              <SimpleTable
                head={['Setting', 'Default', 'What it does']}
                rows={[
                  [<Code key="c">Schedule Date</Code>, '—', 'The day the extension wakes up. For Tatkal, the day before your journey.'],
                  [<Code key="c">Booking Opens At</Code>, 'set for you', 'When IRCTC opens booking. Filled in when you pick the class (see below).'],
                  [<Code key="c">Login Minutes Before</Code>, `${loginMinutesBefore} min`, 'Logs in this many minutes before booking opens.'],
                  [<Code key="c">Search Seconds Before</Code>, `${searchSecondsBefore} s`, 'Searches trains this much earlier and waits on the train list.'],
                  [<Code key="c">Refresh Time (ms)</Code>, String(refreshTime), `How often seats are checked again after the first ${FAST_REFRESH_WINDOW_MS / 1000} seconds.`],
                ]}
              />

              <SubHeading>When booking opens</SubHeading>
              <SimpleTable
                head={['Booking', 'Opens at']}
                rows={[
                  ['Tatkal, AC classes', <Code key="c">{OPENS.ac}</Code>],
                  ['Tatkal, Sleeper and other non-AC', <Code key="c">{OPENS.nonAc}</Code>],
                  ['Opening Day Booking (General)', <Code key="c">{OPENS.openingDay}</Code>],
                ]}
              />

              <SubHeading>How often seats are checked</SubHeading>
              <CheckRhythm fastMs={FAST_REFRESH_MS} fastWindowMs={FAST_REFRESH_WINDOW_MS} refreshMs={refreshTime} />

              <Callout type="info" title="The timer follows your computer's clock">
                Not the clock on the IRCTC page, which runs a few seconds fast. Keep <strong>Set time automatically</strong> turned
                on in your computer&apos;s date and time settings.
              </Callout>
            </Section>

            <Section
              id="opening-day"
              icon={<EventAvailableRoundedIcon />}
              title="Opening Day Booking"
              subtitle="For General quota tickets on the day booking opens, 60 days before the journey."
            >
              <Typography>
                General tickets open <strong>60 days before the journey</strong>, at <Code>{OPENS.openingDay}</Code> IST. The
                journey day itself isn&apos;t counted. Seats on busy trains can go within minutes, so the extension can handle that
                morning the same way it handles Tatkal.
              </Typography>

              <Paper variant="outlined" sx={{ my: 2.5, p: { xs: 2, sm: 2.5 }, borderRadius: '10px' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Example
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="stretch" gap={{ xs: 1, sm: 0 }} sx={{ mt: 1 }}>
                  <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', bgcolor: 'rgba(156, 39, 176, 0.08)', border: '1px solid rgba(156, 39, 176, 0.3)' }}>
                    <Typography sx={{ fontWeight: 800, color: 'secondary.main' }}>16 Jun, {OPENS.openingDay.slice(0, 5)}</Typography>
                    <Typography variant="body2">Booking opens. Schedule Date goes here.</Typography>
                  </Box>
                  <Stack alignItems="center" justifyContent="center" sx={{ px: 2, py: { xs: 0.5, sm: 0 }, minWidth: 120 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>60 days</Typography>
                    <EastRoundedIcon color="action" sx={{ transform: { xs: 'rotate(90deg)', sm: 'none' } }} />
                  </Stack>
                  <Box sx={{ flex: 1, p: 1.5, borderRadius: '8px', bgcolor: 'surface.main' }}>
                    <Typography sx={{ fontWeight: 800, color: '#12134F' }}>15 Aug</Typography>
                    <Typography variant="body2">Journey date.</Typography>
                  </Box>
                </Stack>
              </Paper>

              <SubHeading>Set it up</SubHeading>
              <Box component="ol" sx={{ pl: 2.5 }}>
                <li>Pick a journey date <strong>60 or more days away</strong> and set Quota Type to <Code>GENERAL</Code>.
                  The <Ui>Opening Day Booking</Ui> switch appears under Quota Type.</li>
                <li>Turn it on. <Code>Booking Opens At</Code> changes to <Code>{OPENS.openingDay}</Code> by itself.</li>
                <li>In <strong>Schedule &amp; Timing</strong>, click a <strong>General opening dates</strong> button to set the Schedule Date:
                  <Box component="ul" sx={{ pl: 2.5, mt: 0.5 }}>
                    <li><Ui>D-60</Ui>: the usual choice. Booking opens 60 days before your journey date.</li>
                    <li><Ui>D-61</Ui>: only if your train leaves its <strong>first station the day before</strong> you board.
                      IRCTC counts the 60 days from that first station, so booking opens a day earlier for you.</li>
                  </Box>
                </li>
                <li>Save, switch <Ui>Auto Booking</Ui> ON and keep Chrome open. On that morning the extension logs in at
                  <Code>{shiftTime(OPENS.openingDay, -loginMinutesBefore * 60)}</Code>, searches at
                  <Code>{shiftTime(OPENS.openingDay, -searchSecondsBefore)}</Code> and checks seats right after{' '}
                  <Code>{OPENS.openingDay}</Code>.</li>
              </Box>

              <Callout type="warning" title="Aadhaar-verified accounts only, for the first 15 minutes">
                Since 1 October 2025, in the first 15 minutes after General booking opens, only Aadhaar-verified IRCTC accounts
                can book online. Verify your account well before the day.
              </Callout>

              <SubHeading>Opening Day vs Tatkal</SubHeading>
              <SimpleTable
                head={['', 'Opening Day (General)', 'Tatkal']}
                rows={[
                  ['Quota', <Code key="q">GENERAL</Code>, <Code key="q">TATKAL</Code>],
                  ['Booking opens', `60 days before, ${OPENS.openingDay}`, `1 day before, ${OPENS.ac} (AC) or ${OPENS.nonAc} (non-AC)`],
                  ['Schedule Date', <span key="d"><Ui>D-60</Ui> button (or <Ui>D-61</Ui>)</span>, 'Set for you: the day before the journey'],
                  ['Switch to turn on', <Ui key="s">Opening Day Booking</Ui>, 'None'],
                ]}
              />

              <Callout type="info" title="Don't see the switch?">
                Your journey is less than 60 days away, so General booking is already open. You can book any time; there&apos;s no
                opening rush to beat, so leave Opening Day Booking off.
              </Callout>
            </Section>

            <Section id="auto-booking" icon={<ToggleOnRoundedIcon />} title="Auto Booking switch">
              <SimpleTable
                head={['Switch', 'What happens']}
                rows={[
                  [<strong key="s">ON</strong>, 'The extension runs whenever you open IRCTC and books with your saved details.'],
                  [<span key="s"><strong>ON</strong> + Schedule Date</span>, <>It opens IRCTC and logs in by itself, {loginMinutesBefore} minutes (your setting) before booking opens. The header shows a countdown such as <Code>Login starts in 18h 21m</Code>.</>],
                  [<span key="s"><strong>ON</strong>, less time left</span>, <>A <Ui>Book Ticket on IRCTC</Ui> button appears so you can start by hand.</>],
                  [<strong key="s">OFF</strong>, 'The extension does nothing on IRCTC.'],
                ]}
              />
            </Section>

            <Section id="passengers" icon={<GroupsRoundedIcon />} title="Passengers" subtitle={<>Use <strong>one</strong> of the two ways below.</>}>
              <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '10px', my: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.08rem' }}>➕ New passengers</Typography>
                <Box component="ol" sx={{ pl: 2.5 }}>
                  <li>Open the <strong>Passenger List</strong> tab and click <Ui>Add Passenger</Ui>.</li>
                  <li>Fill in <strong>Name, Age, Gender, Seat Preference</strong> and <strong>Food Choice</strong>, then click the save icon.</li>
                  <li>Tick the checkbox to <Mark>select the passenger for booking</Mark>. Untick or delete anyone not travelling.</li>
                </Box>
                <Callout type="success" title="Name rules">
                  Letters and spaces only, 3 to 16 characters. Write initials without dots: <Code>R Kumar</Code>, not <Code>R. Kumar</Code>.
                </Callout>
              </Paper>

              <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '10px', my: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.08rem' }}>📇 Passenger Master Data</Typography>
                <Typography sx={{ mt: 1 }}>Use names already saved in your IRCTC account. Open the <strong>Passenger Master Data</strong> tab,
                  click <Ui>Add Passenger</Ui>, and enter each first name (or the exact saved name).</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" gap={1.5} sx={{ my: 2 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, flex: 1, width: '100%', borderRadius: '8px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>In your IRCTC master data</Typography>
                    <Stack direction="row" gap={1} sx={{ mt: 0.5 }}><Code>Ajay Singh</Code><Code>Rahul Singh</Code></Stack>
                  </Paper>
                  <EastRoundedIcon color="action" sx={{ transform: { xs: 'rotate(90deg)', sm: 'none' } }} />
                  <Paper variant="outlined" sx={{ p: 1.5, flex: 1, width: '100%', borderRadius: '8px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Add in the extension</Typography>
                    <Stack direction="row" gap={1} sx={{ mt: 0.5 }}><Code>Ajay</Code><Code>Rahul</Code></Stack>
                  </Paper>
                </Stack>
                <Typography>Master Data passengers are filled in automatically during booking.</Typography>
              </Paper>

              <Callout type="warning" title="One or the other">
                Use either <strong>Master Data</strong> or <strong>New Passengers</strong>, not both at the same time.
              </Callout>

              <SubHeading>🍱 Food choice</SubHeading>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <li>On trains with meals, the extension fills in each passenger&apos;s Food Choice.</li>
                <li>Some trains, like Tejas, show a single <strong>I don&apos;t want Food/Beverages</strong> option. If every
                  selected passenger is set to <Code>No Food</Code>, the extension ticks it and confirms IRCTC&apos;s pop-up, so
                  you aren&apos;t charged for meals.</li>
              </Box>

              <SubHeading>👶 Infants without berth</SubHeading>
              <Typography>Turn on <Code>Have Infant Without Berth?</Code> and add the infant&apos;s name, age and gender.</Typography>
            </Section>

            <Section id="before" icon={<ChecklistRoundedIcon />} title="Before booking starts" subtitle="A quick checklist for the morning of booking.">
              <Stack gap={1}>
                {CHECKLIST.map((item, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: '8px', display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon color="success" sx={{ mt: '2px' }} />
                    <Typography>{item}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Section>

            <Section id="on-irctc" icon={<LanguageRoundedIcon />} title="What to do on the IRCTC site" subtitle="Mostly nothing. Here's what you may see at each step.">
              <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {IRCTC_STEPS.map((step, index) => (
                  <Box component="li" key={step.title} sx={{ display: 'grid', gridTemplateColumns: '36px 1fr', columnGap: 2, my: '0 !important' }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar sx={{ width: 34, height: 34, fontSize: '0.95rem', fontWeight: 700, bgcolor: 'surface.main', color: '#12134F' }}>{index + 1}</Avatar>
                      {index < IRCTC_STEPS.length - 1 && (
                        <Box sx={{ position: 'absolute', left: 16, top: 40, bottom: 4, width: 2, backgroundColor: 'divider' }} />
                      )}
                    </Box>
                    <Box sx={{ pb: 3 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', mt: 0.5, mb: 0.5 }}>{step.title}</Typography>
                      {step.body}
                    </Box>
                  </Box>
                ))}
              </Box>
              <Callout type="success" title="That's it">The extension handles the rest. 🚀</Callout>
            </Section>

            <Section id="history" icon={<HistoryRoundedIcon />} title="Booking History">
              <Typography>Every booking attempt is saved automatically (the last 10). Open it with the{' '}
                <Ui>Booking History</Ui> button at the top of the settings page; it slides in from the right. No need to turn on Debug Mode.</Typography>
              <Typography sx={{ mt: 1.5 }}>Each attempt shows how far it got and its result:</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ my: 1.5 }}>
                {HISTORY_OUTCOMES.map((key) => (
                  <Chip key={key} size="small" color={OUTCOMES[key].color} label={OUTCOMES[key].label} />
                ))}
              </Stack>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <li><strong>Timings</strong>: how soon after opening the first seat check went out, and how long IRCTC took from Book Now to the review page.</li>
                <li><strong>Steps</strong>: when each step happened, IRCTC&apos;s messages and, if it stopped, why.</li>
              </Box>
              <Callout type="info" title="Something went wrong? Share the log">
                Use <Ui>Copy log to share</Ui> or <Ui>Report on GitHub</Ui>. The shared log leaves out your login, passenger
                names, mobile number, PNR and IP address.
              </Callout>
            </Section>

            <Section id="avoid" icon={<BlockRoundedIcon />} title="Avoid these while booking">
              <Callout type="error" title={<>These make IRCTC show <IrctcMsg>Sorry!!! Please Try again!!</IrctcMsg> and log you out</>}>
                <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                  <li>Refreshing the page, using the browser&apos;s Back/Forward buttons, or opening IRCTC in a new tab.</li>
                  <li>Double-clicking any button. While IRCTC shows its loading screen, wait.</li>
                  <li>Leaving the IRCTC page idle for a long time.</li>
                </Box>
              </Callout>
            </Section>

            <Section id="faq" icon={<HelpOutlineRoundedIcon />} title="Common questions">
              {FAQ.map((item) => (
                <Accordion key={item.q} disableGutters variant="outlined" sx={{ borderRadius: '8px', mb: 1, '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 650 }}>{item.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Typography>{item.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Section>

            <Paper
              elevation={0}
              sx={{ mt: 6, p: 3, borderRadius: '10px', bgcolor: 'surface.main', color: '#12134F', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography><strong>Stuck or found a bug?</strong> Open Booking History, then click <Ui>Report on GitHub</Ui>.</Typography>
              <Button variant="contained" href={ISSUES_URL} target="_blank" rel="noopener" startIcon={<GitHubIcon />} sx={{ borderRadius: 999 }}>
                GitHub issues
              </Button>
            </Paper>
          </Box>
        </Box>
      </Container>
    </>
  );
}
