import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Typography,
  Toolbar,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const DataTable = ({
  columns,
  data,
  loading = false,
  selectable = false,
  onRowClick,
  onRowSelect,
  onSort,
  onFilter,
  onSearch,
  actions = [],
  pagination = true,
  initialSort = { field: '', direction: 'asc' },
  rowActions = [],
  toolbarActions = [],
  emptyStateComponent,
  searchPlaceholder = 'Search...',
  dense = false,
  stickyHeader = true,
  containerProps = {}
}) => {
  const theme = useTheme();
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Handle row selection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row.id);
      setSelected(newSelected);
      if (onRowSelect) onRowSelect(newSelected);
    } else {
      setSelected([]);
      if (onRowSelect) onRowSelect([]);
    }
  };

  const handleRowSelect = (event, id) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item) => item !== id);
    }

    setSelected(newSelected);
    if (onRowSelect) onRowSelect(newSelected);
  };

  // Handle sorting
  const handleSort = (field) => {
    const newDirection = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction: newDirection });
    if (onSort) onSort(field, newDirection);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  // Handle row actions menu
  const handleRowActionClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleRowActionClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // Render table header
  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={selected.length > 0 && selected.length < data.length}
              checked={data.length > 0 && selected.length === data.length}
              onChange={handleSelectAllClick}
            />
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell
            key={column.field}
            align={column.align || 'left'}
            sortDirection={sortConfig.field === column.field ? sortConfig.direction : false}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {column.sortable !== false ? (
              <TableSortLabel
                active={sortConfig.field === column.field}
                direction={sortConfig.field === column.field ? sortConfig.direction : 'asc'}
                onClick={() => handleSort(column.field)}
              >
                {column.headerName}
              </TableSortLabel>
            ) : (
              column.headerName
            )}
          </TableCell>
        ))}
        {rowActions.length > 0 && <TableCell align="right">Actions</TableCell>}
      </TableRow>
    </TableHead>
  );

  // Render table body
  const renderTableBody = () => {
    if (loading) {
      return (
        <TableBody>
          {[...Array(rowsPerPage)].map((_, index) => (
            <TableRow key={index}>
              {selectable && (
                <TableCell padding="checkbox">
                  <Skeleton variant="rectangular" width={24} height={24} />
                </TableCell>
              )}
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
              {rowActions.length > 0 && (
                <TableCell>
                  <Skeleton variant="rectangular" width={100} height={24} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (!data.length) {
      return (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)}
              align="center"
            >
              {emptyStateComponent || (
                <Typography color="textSecondary">
                  No data available
                </Typography>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
          <TableRow
            hover
            key={row.id}
            onClick={() => onRowClick && onRowClick(row)}
            selected={selected.includes(row.id)}
            sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.includes(row.id)}
                  onChange={(event) => handleRowSelect(event, row.id)}
                  onClick={(event) => event.stopPropagation()}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell
                key={column.field}
                align={column.align || 'left'}
              >
                {column.renderCell ? column.renderCell(row) : row[column.field]}
              </TableCell>
            ))}
            {rowActions.length > 0 && (
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={(event) => handleRowActionClick(event, row)}
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    );
  };

  // Render toolbar
  const renderToolbar = () => (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(selected.length > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {selected.length > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {selected.length} selected
        </Typography>
      ) : (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={handleSearch}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}

      {/* Toolbar Actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {selected.length > 0 ? (
          toolbarActions.map((action, index) => (
            <Tooltip key={index} title={action.tooltip || action.label}>
              <IconButton onClick={() => action.onClick(selected)}>
                {action.icon}
              </IconButton>
            </Tooltip>
          ))
        ) : (
          actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outlined'}
              startIcon={action.icon}
              onClick={action.onClick}
              size="small"
            >
              {action.label}
            </Button>
          ))
        )}
      </Box>
    </Toolbar>
  );

  return (
    <Paper {...containerProps}>
      {renderToolbar()}
      <TableContainer>
        <Table
          size={dense ? 'small' : 'medium'}
          stickyHeader={stickyHeader}
        >
          {renderTableHeader()}
          {renderTableBody()}
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Row Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleRowActionClose}
      >
        {rowActions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              action.onClick(selectedRow);
              handleRowActionClose();
            }}
          >
            {action.icon && (
              <ListItemIcon>
                {action.icon}
              </ListItemIcon>
            )}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};

export default DataTable;