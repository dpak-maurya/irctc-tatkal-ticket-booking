import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridRowModes, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import { useAppContext } from '../contexts/AppContext';

const infantAgeOptions = [
  { value: 0, label: 'Below one year' },
  { value: 1, label: 'One year' },
  { value: 2, label: 'Two years' },
  { value: 3, label: 'Three years' },
  { value: 4, label: 'Four years' }
];

const infantGenderOptions = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' }
];

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Date.now(); // Generate a new ID
    setRows((oldRows) => [
      ...oldRows,
      { id, name: '', age: '', gender: '', isNew: true },
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
        Add Infant Without Berth
      </Button>
    </GridToolbarContainer>
  );
}

const InfantList = () => {
  const { formData, handleChange } = useAppContext();
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [rowSelection, setRowSelection] = useState([]);

  // Initialize rows and selection model from formData on mount
  useEffect(() => {
    setRows(formData.infantList || []);
    const initiallySelectedIds = (formData.infantList || [])
      .filter((infant) => infant.isSelected)
      .map((infant) => infant.id);
    setRowSelection(initiallySelectedIds);
  }, [formData.infantList]);

  // Sync infant list with formData
  const syncInfantList = (updatedRows) => {
    handleChange({ target: { name: 'infantList', value: updatedRows } });
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
    setRowSelection(rowSelection.filter((selectedId) => selectedId !== id));
    syncInfantList(filterRows);
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
    const isAgeValid = updatedRow.age !== '' && updatedRow.age >= 0 && updatedRow.age <= 4;
    
    if (!isAgeValid) {
      return { ...updatedRow, error: true }; // Keeps the error indicator
    }
  
    const updatedRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));
    setRows(updatedRows);
    syncInfantList(updatedRows);
    
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowSelectionChange = (newSelection) => {
    setRowSelection(newSelection);
    const updatedRows = rows.map((row) => ({
      ...row,
      isSelected: newSelection.includes(row.id),
    }));
    syncInfantList(updatedRows);
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
      type: 'singleSelect',
      valueOptions: infantAgeOptions,
      width: 150,
      editable: true,
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: infantGenderOptions,
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
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{ color: 'primary.main' }}
              onClick={handleSaveClick(id)}
              key="save"
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
              key="cancel"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="primary"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="error"
          />,
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
        checkboxSelection 
        rowSelectionModel={rowSelection}
        onRowSelectionModelChange={handleRowSelectionChange}
        experimentalFeatures={{ newEditingApi: true }} 
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        disableColumnFilter 
        disableColumnSelector 
        disableDensitySelector 
        disableRowSelectionOnClick 
        hideFooter
      />
      <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
        Tip: Select the checkbox for each infant you want to book. Unselected infants will not be filled.
      </Typography>
    </Box>
  );
};

export default InfantList;
