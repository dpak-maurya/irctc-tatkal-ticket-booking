import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField } from '@mui/material';
import { sharedStyles } from '../styles';

// The lists are thousands of rows long, so only the best few are rendered.
const MAX_OPTIONS = 50;

const filterOptions = (options, { inputValue }) => {
  const query = inputValue.trim().toUpperCase();
  if (!query) return [];

  const startsWith = [];
  const contains = [];
  for (let i = 0; i < options.length; i += 1) {
    const option = options[i];
    if (option.code.startsWith(query) || option.name.startsWith(query)) startsWith.push(option);
    else if (option.label.includes(query)) contains.push(option);
    if (startsWith.length >= MAX_OPTIONS) break;
  }
  return startsWith.concat(contains).slice(0, MAX_OPTIONS);
};

/**
 * Autocomplete over a reference list that saves a canonical value.
 * store="code"  -> station code / train number, the value the automation types
 * store="label" -> "NAME - CODE", the value the boarding dropdown is matched on
 * Free text is still accepted: IRCTC adds stations and trains between data refreshes.
 */
function LookupField({
  label,
  name,
  value = '',
  options,
  store = 'code',
  normalize = (raw) => raw,
  onCommit,
  placeholder = '',
  helperText = '',
  required = false,
}) {
  const selected = useMemo(
    () => options.find((option) => (store === 'label' ? option.label : option.code) === value) || null,
    [options, value, store]
  );

  const display = selected ? selected.label : value || '';
  const [text, setText] = useState(display);

  // Keeps the box in sync with saved settings, a reset, or a late data load.
  useEffect(() => {
    setText(display);
  }, [display]);

  // Accepts a code, a name, or the full "NAME - CODE" label before falling back
  // to the field's own formatting.
  const resolve = (raw) => {
    const query = String(raw).trim().toUpperCase();
    if (!query) return '';
    const match =
      options.find((option) => option.label === query) ||
      options.find((option) => option.code === query) ||
      options.find((option) => option.name === query);
    if (!match) return normalize(query);
    return store === 'label' ? match.label : match.code;
  };

  const handleChange = (event, next) => {
    if (!next) onCommit('');
    else if (typeof next === 'string') onCommit(resolve(next));
    else onCommit(store === 'label' ? next.label : next.code);
  };

  return (
    <Autocomplete
      fullWidth
      freeSolo
      autoHighlight
      selectOnFocus
      options={options}
      filterOptions={filterOptions}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
      inputValue={text}
      onInputChange={(event, next) => setText(next)}
      onChange={handleChange}
      onBlur={() => onCommit(resolve(text))}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          name={name}
          margin='normal'
          required={required}
          variant='outlined'
          placeholder={placeholder}
          helperText={helperText}
          sx={sharedStyles.input}
        />
      )}
    />
  );
}

LookupField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  store: PropTypes.oneOf(['code', 'label']),
  normalize: PropTypes.func,
  onCommit: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
};

export default LookupField;
