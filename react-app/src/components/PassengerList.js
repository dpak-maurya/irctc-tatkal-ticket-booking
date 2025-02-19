import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridToolbarContainer, GridActionsCellItem, GridRowModes } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { useAppContext } from '../contexts/AppContext';

const genderOptions = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'T', label: 'Transgender' },
];

const preferenceOptions = [
  { value: 'No Preference', label: 'No Preference' },
  { value: 'LB', label: 'Lower' },
  { value: 'MB', label: 'Middle' },
  { value: 'UB', label: 'Upper' },
  { value: 'SL', label: 'Side Lower' },
  { value: 'SU', label: 'Side Upper' },
];

const foodOptions = [
  { value: '', label: '-' },
  { value: 'V', label: 'Veg' },
  { value: 'N', label: 'Non Veg' },
  { value: 'J', label: 'Jain Meal' },
  { value: 'F', label: 'Veg (Diabetic)' },
  { value: 'G', label: 'Non Veg (Diabetic)' },
  { value: 'D', label: 'No Food' },
];

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Date.now(); // Generate a new ID
    setRows((oldRows) => [
      ...oldRows,
      { id, name: '', age: '', gender: '', preference: '', foodChoice: '', isNew: true },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  // Prop types validation
  EditToolbar.propTypes = {
    setRows: PropTypes.func.isRequired,
    setRowModesModel: PropTypes.func.isRequired,
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add Passenger
      </Button>
    </GridToolbarContainer>
  );
}

const PassengerList = () => {
  const { formData, handleChange } = useAppContext();
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [rowSelection, setRowSelection] = useState([]);

  // Initialize rows and selection model from formData on mount
  useEffect(() => {
    setRows(formData.passengerList);
    const initiallySelectedIds = formData.passengerList
      .filter((passenger) => passenger.isSelected)
      .map((passenger) => passenger.id);
    setRowSelection(initiallySelectedIds);

    console.log(formData.passengerList);
  }, [formData.passengerList]);

  // Sync passenger list with formData
  const syncPassengerList = (updatedRows) => {
    handleChange({ target: { name: 'passengerList', value: updatedRows } });
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === 'rowFocusOut') {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    const filterRows = rows.filter((row) => row.id !== id);
    setRows(filterRows);
    setRowSelection(rowSelection.filter((selectedId) => selectedId !== id)); // Remove deleted id from selection
    syncPassengerList(filterRows);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { 
      ...newRow,
      name: newRow?.name?.slice(0, 16), // Enforce max 16 characters
      isNew: false 
    };
  
    // Validate age
    const isAgeValid = newRow.age >= 1 && newRow.age <= 125 && !isNaN(newRow.age);
    if (!isAgeValid) {
      return { ...newRow, error: true }; // Keeps the error indicator
    }
  
    const updatedRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));
    setRows(updatedRows);
    syncPassengerList(updatedRows);
    
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // Handle selection change and update isSelected field
  const handleRowSelectionChange = (newSelection) => {
    console.log(newSelection);
    setRowSelection(newSelection);

    const updatedRows = rows.map((row) => ({
      ...row,
      isSelected: newSelection.includes(row.id),
    }));

    // setRows(updatedRows);
    syncPassengerList(updatedRows);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      editable: true
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 80,
      editable: true,
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: genderOptions,
    },
    {
      field: 'preference',
      headerName: 'Preference',
      width: 180,
      editable: true,
      type: 'singleSelect',
      valueOptions: preferenceOptions,
    },
    {
      field: 'foodChoice',
      headerName: 'Food Choice',
      width: 180,
      editable: true,
      type: 'singleSelect',
      valueOptions: foodOptions,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem key="save" icon={<SaveIcon />} label="Save" sx={{ color: 'primary.main' }} onClick={handleSaveClick(id)} />,
            <GridActionsCellItem key="cancel" icon={<CancelIcon />} label="Cancel" onClick={handleCancelClick(id)} color="inherit" />,
          ];
        }

        return [
          <GridActionsCellItem key="edit" icon={<EditIcon />} label="Edit" onClick={handleEditClick(id)} color="primary" />,
          <GridActionsCellItem key="delete" icon={<DeleteIcon />} label="Delete" onClick={handleDeleteClick(id)} color="error" />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        checkboxSelection // Enable checkbox selection
        rowSelectionModel={rowSelection}
        onRowSelectionModelChange={handleRowSelectionChange}
        experimentalFeatures={{ newEditingApi: true }} // Enables new editing features including error highlighting
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        // pagination  // Disable pagination
        disableColumnFilter // Disable filtering
        disableColumnSelector // Disable column management
        disableDensitySelector // Disable density selector
        disableRowSelectionOnClick // Optional: Prevent row selection on click
        hideFooter
      />
      {rows.length === 0 && (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          No passengers added.
        </Box>
      )}
    </Box>
  );
};

export default PassengerList;
