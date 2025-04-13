import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  Popper,
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Article as ArticleIcon,
  Person as PersonIcon,
  Tag as TagIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';

const SearchBar = ({ onClose, placeholder = 'Search...', sx }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    // Load recent searches from localStorage
    const loadRecentSearches = () => {
      try {
        const saved = localStorage.getItem('recentSearches');
        return saved ? JSON.parse(saved) : [];
      } catch (error) {
        console.error('Error loading recent searches:', error);
        return [];
      }
    };

    setRecentSearches(loadRecentSearches());

    // Mock trending searches
    setTrendingSearches([
      { id: 1, term: 'Latest Features' },
      { id: 2, term: 'Documentation' },
      { id: 3, term: 'API Reference' },
      { id: 4, term: 'Getting Started' }
    ]);
  }, []);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock search results
        const mockResults = [
          {
            type: 'article',
            title: `Article about ${debouncedQuery}`,
            description: 'Lorem ipsum dolor sit amet...',
            url: '/articles/1'
          },
          {
            type: 'user',
            title: 'John Doe',
            description: 'Software Engineer',
            url: '/users/johndoe'
          },
          {
            type: 'tag',
            title: `#${debouncedQuery}`,
            description: '123 posts',
            url: `/tags/${debouncedQuery}`
          }
        ];

        setResults(mockResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchData();
  }, [debouncedQuery]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!query) return;

    // Save to recent searches
    const updateRecentSearches = () => {
      const updated = [
        { term: query, timestamp: new Date().toISOString() },
        ...recentSearches.filter(item => item.term !== query)
      ].slice(0, 5);

      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    updateRecentSearches();
    navigate(`/search?q=${encodeURIComponent(query)}`);
    handleClose();
  };

  const handleResultClick = (url) => {
    navigate(url);
    handleClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    if (onClose) onClose();
  };

  const handleFocus = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'search-popper' : undefined;

  const renderIcon = (type) => {
    switch (type) {
      case 'article':
        return <ArticleIcon />;
      case 'user':
        return <PersonIcon />;
      case 'tag':
        return <TagIcon />;
      default:
        return <SearchIcon />;
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', ...sx }}>
        <Paper
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            border: open ? 1 : 0,
            borderColor: 'primary.main'
          }}
        >
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
          <InputBase
            inputRef={inputRef}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            sx={{ ml: 1, flex: 1 }}
          />
          {query && (
            <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={() => setQuery('')}>
              <CloseIcon />
            </IconButton>
          )}
        </Paper>

        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
        >
          <Paper sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : query ? (
              <List>
                {results.map((result, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleResultClick(result.url)}
                  >
                    <ListItemIcon>
                      {renderIcon(result.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.title}
                      secondary={result.description}
                    />
                  </ListItem>
                ))}
                {results.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No results found"
                      secondary="Try different keywords"
                      sx={{ textAlign: 'center' }}
                    />
                  </ListItem>
                )}
              </List>
            ) : (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Recent Searches
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {recentSearches.map((item, index) => (
                          <Chip
                            key={index}
                            icon={<HistoryIcon />}
                            label={item.term}
                            onClick={() => setQuery(item.term)}
                            onDelete={() => {
                              const updated = recentSearches.filter((_, i) => i !== index);
                              setRecentSearches(updated);
                              localStorage.setItem('recentSearches', JSON.stringify(updated));
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Divider />
                  </>
                )}

                {/* Trending Searches */}
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Trending Searches
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {trendingSearches.map((item) => (
                      <Chip
                        key={item.id}
                        icon={<TrendingUpIcon />}
                        label={item.term}
                        onClick={() => setQuery(item.term)}
                      />
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;