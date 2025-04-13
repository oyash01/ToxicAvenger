import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import ReactDiffViewer from 'react-diff-viewer';

const JsonDiffViewer = ({ oldData, newData }) => {
  const theme = useTheme();

  const formatJson = (data) => {
    try {
      return typeof data === 'string' 
        ? data 
        : JSON.stringify(data, null, 2);
    } catch (error) {
      return 'Invalid JSON';
    }
  };

  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      <ReactDiffViewer
        oldValue={formatJson(oldData)}
        newValue={formatJson(newData)}
        splitView={true}
        hideLineNumbers={false}
        showDiffOnly={false}
        styles={{
          variables: {
            light: {
              diffViewerBackground: theme.palette.background.paper,
              diffViewerColor: theme.palette.text.primary,
              addedBackground: theme.palette.success.light,
              addedColor: theme.palette.success.dark,
              removedBackground: theme.palette.error.light,
              removedColor: theme.palette.error.dark,
              wordAddedBackground: theme.palette.success.main,
              wordRemovedBackground: theme.palette.error.main,
              addedGutterBackground: theme.palette.success.light,
              removedGutterBackground: theme.palette.error.light,
              gutterBackground: theme.palette.background.default,
              gutterBackgroundDark: theme.palette.background.default,
              highlightBackground: theme.palette.action.selected,
              highlightGutterBackground: theme.palette.action.selected,
            },
            dark: {
              diffViewerBackground: theme.palette.background.paper,
              diffViewerColor: theme.palette.text.primary,
              addedBackground: `${theme.palette.success.dark}40`,
              addedColor: theme.palette.success.light,
              removedBackground: `${theme.palette.error.dark}40`,
              removedColor: theme.palette.error.light,
              wordAddedBackground: theme.palette.success.dark,
              wordRemovedBackground: theme.palette.error.dark,
              addedGutterBackground: `${theme.palette.success.dark}40`,
              removedGutterBackground: `${theme.palette.error.dark}40`,
              gutterBackground: theme.palette.background.default,
              gutterBackgroundDark: theme.palette.background.default,
              highlightBackground: theme.palette.action.selected,
              highlightGutterBackground: theme.palette.action.selected,
            }
          }
        }}
        useDarkTheme={theme.palette.mode === 'dark'}
      />
    </Paper>
  );
};

export default JsonDiffViewer;