

import React, { useState, useEffect } from "react";
import { ref, onValue, remove, get } from "firebase/database";
import { database } from "../firebase";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Container,
  Box,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CryptoJS from "crypto-js";


const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const secretKey = "123456789";

  useEffect(() => {
    const itemsRef = ref(database, 'items');

    const unsubscribe = onValue(itemsRef, (snapshot) => {
      setLoading(true);
      const data = snapshot.val();
      if (data) {
        const itemsList = Object.entries(data).map(([key, values]) => ({
          ...values,
          firebaseKey: key,
        }));
        setItems(itemsList);
      } else {
        setItems([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Database error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      const itemRef = ref(database, `items/${itemToDelete}`);
      remove(itemRef)
        .then(() => {
          // Item successfully deleted
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        })
        .catch((error) => {
          console.error("Error deleting item:", error);
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        });
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const getStatusChip = (statusId) => {
    if (statusId === 1) {
      return <Chip label="Lost" color="error" size="small" />;
    } else if (statusId === 2) {
      return <Chip label="Found" color="success" size="small" />;
    } else if (statusId === 3) {
      return <Chip label="Claimed" color="info" size="small" />;
    }
    return <Chip label="Unknown" size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Items Management
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/items/new"
          sx={{ mb: 2 }}
        >
          Add New Item
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.firebaseKey}>
                  {" "}
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{getStatusChip(item.status_id)}</TableCell>
                  <TableCell>{item.location || "N/A"}</TableCell>
                  <TableCell>{item.contact_name}</TableCell>
                  <TableCell>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      component={Link}
                      to={`/items/${encodeURIComponent(CryptoJS.AES.encrypt(item.firebaseKey, secretKey).toString())}`}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      component={Link}
                      to={`/items/${encodeURIComponent(CryptoJS.AES.encrypt(item.firebaseKey, secretKey).toString())}/edit`} 
                      size="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => confirmDelete(item.firebaseKey)} 
                      size="small"
                      color="error"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ItemsList;
