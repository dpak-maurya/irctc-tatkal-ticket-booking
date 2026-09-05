import { useEffect, useState } from 'react';
import { loadReferenceData } from './referenceData';

// Station/train lists for the form dropdowns. Empty until the fetch resolves.
export const useReferenceData = (kind) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let active = true;
    loadReferenceData(kind).then((data) => {
      if (active) setOptions(data);
    });
    return () => {
      active = false;
    };
  }, [kind]);

  return options;
};

export default useReferenceData;
