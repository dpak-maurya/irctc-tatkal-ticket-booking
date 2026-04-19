import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Stack,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestoreIcon from '@mui/icons-material/Restore';
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';
import CodeIcon from '@mui/icons-material/Code';
import SELECTOR_CATEGORIES, { CUSTOM_SELECTORS_STORAGE_KEY } from '../selectorDefaults';

const SelectorEditor = () => {
  const [overrides, setOverrides] = useState({});
  const [savedOverrides, setSavedOverrides] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isDirty, setIsDirty] = useState(false);

  // Load saved overrides from chrome.storage on mount
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(CUSTOM_SELECTORS_STORAGE_KEY, (result) => {
        const saved = result[CUSTOM_SELECTORS_STORAGE_KEY] || {};
        setOverrides(saved);
        setSavedOverrides(saved);
      });
    }
  }, []);

  // Track dirty state
  useEffect(() => {
    const currentKeys = Object.keys(overrides).filter((k) => overrides[k]);
    const savedKeys = Object.keys(savedOverrides).filter((k) => savedOverrides[k]);
    
    if (currentKeys.length !== savedKeys.length) {
      setIsDirty(true);
      return;
    }
    const hasChanges = currentKeys.some((k) => overrides[k] !== savedOverrides[k]);
    setIsDirty(hasChanges);
  }, [overrides, savedOverrides]);

  const handleSelectorChange = useCallback((key, value) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (value.trim() === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }, []);

  const handleResetOne = useCallback((key) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleResetAll = useCallback(() => {
    setOverrides({});
  }, []);

  const handleSave = useCallback(async () => {
    // Clean up empty values before saving
    const cleanOverrides = {};
    for (const [key, value] of Object.entries(overrides)) {
      if (value && value.trim() !== '') {
        cleanOverrides[key] = value.trim();
      }
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [CUSTOM_SELECTORS_STORAGE_KEY]: cleanOverrides }, () => {
        setSavedOverrides(cleanOverrides);
        setOverrides(cleanOverrides);
        setSnackbar({ open: true, message: 'Selectors saved! Changes will apply on next page load.', severity: 'success' });
      });
    }
  }, [overrides]);

  const overrideCount = Object.keys(overrides).filter((k) => overrides[k] && overrides[k].trim() !== '').length;

  return (
    <Box sx={{ mt: 4 }}>
      <Accordion
        expanded={expanded}
        onChange={(_, isExpanded) => setExpanded(isExpanded)}
        sx={{
          backgroundColor: '#F0F4FF',
          border: '1px solid #D6E3FF',
          borderRadius: '12px !important',
          '&:before': { display: 'none' },
          boxShadow: expanded ? '0 4px 20px rgba(65, 95, 145, 0.15)' : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            borderRadius: '12px',
            '&:hover': { backgroundColor: '#E8EEFF' },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
            <TuneIcon sx={{ color: '#415F91' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E2A38' }}>
              Advanced: DOM Selectors
            </Typography>
            {overrideCount > 0 && (
              <Chip
                label={`${overrideCount} customized`}
                size="small"
                sx={{
                  backgroundColor: '#FF9800',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Stack>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 0, px: 3, pb: 3 }}>
          {/* Description */}
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              If IRCTC changes their website structure and the automation breaks, you can update the CSS selectors here.
              Leave a field empty to use the default value. Changes take effect on the next page load.
            </Typography>
          </Alert>

          {/* Action buttons */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isDirty}
              sx={{
                backgroundColor: '#415F91',
                '&:hover': { backgroundColor: '#334B7A' },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Save Selectors
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={handleResetAll}
              disabled={overrideCount === 0 && !isDirty}
              sx={{
                borderColor: '#BA1A1A',
                color: '#BA1A1A',
                '&:hover': { borderColor: '#8B0000', color: '#8B0000', backgroundColor: '#FFF0F0' },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Reset All to Defaults
            </Button>
          </Stack>

          {/* Selector categories */}
          {Object.entries(SELECTOR_CATEGORIES).map(([categoryKey, category]) => {
            const categoryOverrideCount = Object.keys(category.selectors).filter(
              (sKey) => overrides[sKey] && overrides[sKey].trim() !== ''
            ).length;

            return (
              <Accordion
                key={categoryKey}
                sx={{
                  mb: 1.5,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E0E7F5',
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#415F91' }} />}
                  sx={{
                    borderRadius: '8px',
                    minHeight: 48,
                    '&:hover': { backgroundColor: '#F5F7FC' },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CodeIcon sx={{ color: '#415F91', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 600, color: '#1E2A38', fontSize: '0.95rem' }}>
                      {category.label}
                    </Typography>
                    <Typography sx={{ color: '#5F6368', fontSize: '0.8rem' }}>
                      ({Object.keys(category.selectors).length} selectors)
                    </Typography>
                    {categoryOverrideCount > 0 && (
                      <Chip
                        label={`${categoryOverrideCount} modified`}
                        size="small"
                        sx={{
                          backgroundColor: '#FFF3E0',
                          color: '#E65100',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    )}
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 1 }}>
                  {Object.entries(category.selectors).map(([selectorKey, selectorDef]) => {
                    const isOverridden = overrides[selectorKey] && overrides[selectorKey].trim() !== '';

                    return (
                      <Box
                        key={selectorKey}
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: isOverridden ? '#FFF8E1' : '#FAFBFD',
                          border: isOverridden ? '1px solid #FFE082' : '1px solid #EEF1F8',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#1E2A38',
                              fontSize: '0.85rem',
                            }}
                          >
                            {selectorDef.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              color: '#8B95A5',
                              fontSize: '0.7rem',
                              backgroundColor: '#F0F2F7',
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                            }}
                          >
                            {selectorKey}
                          </Typography>
                          {isOverridden && (
                            <Chip
                              label="Modified"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                backgroundColor: '#FF9800',
                                color: 'white',
                              }}
                            />
                          )}
                        </Stack>

                        <TextField
                          fullWidth
                          size="small"
                          placeholder={selectorDef.default}
                          value={overrides[selectorKey] || ''}
                          onChange={(e) => handleSelectorChange(selectorKey, e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                              backgroundColor: 'white',
                              borderRadius: 1.5,
                              '& fieldset': {
                                borderColor: isOverridden ? '#FFB74D' : '#D0D5E0',
                              },
                              '&:hover fieldset': {
                                borderColor: '#415F91',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#415F91',
                              },
                            },
                            '& .MuiInputBase-input::placeholder': {
                              color: '#9E9E9E',
                              opacity: 1,
                              fontFamily: 'monospace',
                            },
                          }}
                          InputProps={{
                            endAdornment: isOverridden ? (
                              <InputAdornment position="end">
                                <Tooltip title="Reset to default">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleResetOne(selectorKey)}
                                    sx={{ color: '#BA1A1A' }}
                                  >
                                    <RestoreIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            ) : null,
                          }}
                        />

                        {!isOverridden && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              color: '#8B95A5',
                              fontFamily: 'monospace',
                              fontSize: '0.7rem',
                            }}
                          >
                            Default: {selectorDef.default}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </AccordionDetails>
      </Accordion>

      {/* Snackbar for save confirmation */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SelectorEditor;
