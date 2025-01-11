import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppContext } from '../contexts/AppContext';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridToolbarContainer, GridActionsCellItem, GridRowModes } from '@mui/x-data-grid';
import PropTypes from 'prop-types';

// Toolbar for adding passengers
function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Date.now(); // Generate a unique ID based on the current timestamp
    setRows((oldRows) => [
      ...oldRows,
      { id, name: '', isNew: true },
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

const PassengerNames = () => {
  const { formData, handleChange } = useAppContext();

  const columns = [
    { field: 'name', headerName: 'Name', width: 180, editable: true },
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

  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [rowSelection, setRowSelection] = useState([]);

  // Initialize rows and selection model from formData on mount
  useEffect(() => {
    setRows(formData.passengerNames);
    const initiallySelectedIds = formData.passengerNames
      .filter((passenger) => passenger.isSelected)
      .map((passenger) => passenger.id);
    setRowSelection(initiallySelectedIds);
    
    console.log(formData.passengerNames);

  }, [formData.passengerNames]);

  // Sync passenger list with formData
  const syncPassengerNames = (updatedRows) => {
    handleChange({ target: { name: 'passengerNames', value: updatedRows } });
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
    syncPassengerNames(filterRows);
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

  // Handle row updates
  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    const updatedRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));
    setRows(updatedRows);
    syncPassengerNames(updatedRows);
    return updatedRow;
  };
  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // Handle selection change and update isSelected field
  const handleRowSelectionChange = (newSelection) => {
    console.log(newSelection)
    setRowSelection(newSelection);

    const updatedRows = rows.map((row) => ({
      ...row,
      isSelected: newSelection.includes(row.id),
    }));
    syncPassengerNames(updatedRows);
  };

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
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        pagination={false}  // Disable pagination
        disableColumnFilter // Disable filtering
        disableColumnSelector // Disable column management
        disableDensitySelector // Disable density selector
        disableRowSelectionOnClick
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

export default PassengerNames;
