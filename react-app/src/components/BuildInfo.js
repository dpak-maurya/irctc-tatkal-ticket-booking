// Test builds (npm run build:test) include build-info.json; release builds
// don't, so this shows nothing there.
import React, { useEffect, useState } from 'react';
import { Chip, Tooltip, useMediaQuery } from '@mui/material';

export function useBuildInfo() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    fetch('build-info.json')
      .then((response) => (response.ok ? response.json() : null))
      .then(setInfo)
      .catch(() => {});
  }, []);
  return info;
}

// "feat/timed-availability-flow" -> "timed-availability-flow"
const shortBranch = (branch) => branch.replace(/^(feat|fix|chore|docs)\//, '');

export default function BuildInfoChip() {
  const info = useBuildInfo();
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  if (!info) return null;

  const built = new Date(info.builtAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  return (
    <Tooltip arrow title={`Test build ${info.version} from ${info.branch} @ ${info.commit}, built ${built} IST`}>
      <Chip
        size="small"
        color="warning"
        variant="outlined"
        sx={{ fontWeight: 700, maxWidth: { xs: 120, sm: 360 } }}
        label={isPhone ? `TEST ${info.version}` : `TEST ${info.version} · ${shortBranch(info.branch)} · ${info.commit}`}
      />
    </Tooltip>
  );
}
