import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../firebase';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  Button, 
  Chip, 
  Divider,
  CircularProgress
} from '@mui/material';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const itemRef = ref(database, `items/${id}`);
    const unsubscribe = onValue(itemRef, (snapshot) => {
      setLoading(true);
      if (snapshot.exists()) {
        setItem({ id, ...snapshot.val() });
      } else {
        setError('Item not found');
      }
      setLoading(false);
    }, (error) => {
      setError(`Error loading item: ${error.message}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleStatusChange = (newStatusId) => {
    if (!id || !item) return;
    
    setLoading(true);
    const itemRef = ref(database, `items/${id}`);
    update(itemRef, { 
      status_id: newStatusId,
      updated_at: new Date().toISOString()
    })
      .then(() => {
        // Success handled by onValue listener
      })
      .catch((error) => {
        setError(`Failed to update status: ${error.message}`);
        setLoading(false);
      });
  };

  const getStatusChip = (statusId) => {
    if (statusId === 1) {
      return <Chip label="Lost" color="error" />;
    } else if (statusId === 2) {
      return <Chip label="Found" color="success" />;
    } else if (statusId === 3) {
      return <Chip label="Claimed" color="info" />;
    }
    return <Chip label="Unknown" />;
  };

  const renderStatusActions = () => {
    if (!item) return null;
    
    if (item.status_id === 1) {
      return (
        <Button 
          variant="contained" 
          color="success"
          onClick={() => handleStatusChange(2)}
        >
          Mark as Found
        </Button>
      );
    } else if (item.status_id === 2) {
      return (
        <Button 
          variant="contained" 
          color="info"
          onClick={() => handleStatusChange(3)}
        >
          Mark as Claimed
        </Button>
      );
    }
    return null;
  };

  if (loading && !item) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button component={Link} to="/items" sx={{ mt: 2 }}>
            Back to Items
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!item) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6">Item not found</Typography>
          <Button component={Link} to="/items" sx={{ mt: 2 }}>
            Back to Items
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h4" component="h1">
            {item.title}
          </Typography>
          <Box>
            {getStatusChip(item.status_id)}
          </Box>
        </Box>

        {item.image && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <img 
              src={item.image}
              alt={item.title}
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Description</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {item.description}
            </Typography>
          </Grid>

          {item.location && (
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Location</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {item.location}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Date Posted</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Contact Information</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Name</Typography>
            <Typography variant="body1">{item.contact_name}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Phone</Typography>
            <Typography variant="body1">{item.contact_phone}</Typography>
          </Grid>

          {item.contact_email && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">Email</Typography>
              <Typography variant="body1">{item.contact_email}</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/items"
                  sx={{ mr: 2 }}
                >
                  Back to List
                </Button>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to={`/items/${id}/edit`}
                >
                  Edit
                </Button>
              </Box>
              <Box>
                {renderStatusActions()}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ItemDetail;