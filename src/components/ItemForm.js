import React, { useState, useEffect } from "react";
import { ref, push, get, update } from "firebase/database";
import { database } from "../firebase";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
  InputLabel,
  Typography,
  Container,
  Paper,
  Grid,
} from "@mui/material";
import CryptoJS from "crypto-js";

const ItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const secretKey = "123456789";

  const decodedUrl = decodeURIComponent(id);
  const bytes = CryptoJS.AES.decrypt(decodedUrl, secretKey);
  const originalUrl = bytes.toString(CryptoJS.enc.Utf8);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status_id: 1,
    location: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      const itemRef = ref(database, `items/${originalUrl}`);

      get(itemRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setFormData(snapshot.val());
          } else {
            setError("Item not found");
          }
        })
        .catch((error) => {
          setError("Error loading item: " + error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      status_id: parseInt(e.target.value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const currentDate = new Date().toISOString();
      const itemData = {
        ...formData,
        updated_at: currentDate,
      };

      if (!isEditing) {
        // Adding new item
        itemData.created_at = currentDate;
        const newItemRef = push(ref(database, "items"));
        await update(newItemRef, itemData);
      } else {
        // Updating existing item
        const itemRef = ref(database, `items/${originalUrl}`);
        await update(itemRef, itemData);
      }

      navigate("/items");
    } catch (error) {
      setError("Error saving item: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? "Edit Item" : "Add New Item"}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status_id}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value={1}>Lost</MenuItem>
                  <MenuItem value={2}>Found</MenuItem>
                  <MenuItem value={3}>Claimed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Contact Name"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Contact Phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => navigate("/items")}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ItemForm;
