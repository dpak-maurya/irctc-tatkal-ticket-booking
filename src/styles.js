// styles.js
export const sharedStyles = {
    container: {
      mb: 3,
      p: 3,
      borderRadius: '8px',
      backgroundColor: 'rgb(214, 227, 255)', // Background color
      '&:hover': {
      boxShadow: 2, // Change box shadow to 2 on hover
    },
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
    }
  };
  