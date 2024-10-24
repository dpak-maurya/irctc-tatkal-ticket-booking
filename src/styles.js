// styles.js
export const sharedStyles = {
    container: {
      mb: 3,
      p: 3,
      borderRadius: '8px',
      backgroundColor: 'rgb(214, 227, 255)', // Background color
      boxShadow: 2,
    },
    input: {
      backgroundColor: 'white', // Input field background color
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#ccc',
        },
        '&:hover fieldset': {
          borderColor: '#999',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#007BFF',
        },
      },
    },
    select: {
        backgroundColor: 'white', // Dropdown background color
        '& .MuiSelect-select': {
          padding: '10px', // Optional: Adjust padding for dropdown
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#ccc',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#999',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#007BFF',
        },
      },
  };
  