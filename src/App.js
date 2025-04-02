import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { CircularProgress, Box } from '@mui/material';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ItemsList from './components/ItemsList';
import ItemForm from './components/ItemForm';
import ItemDetail from './components/ItemDetail';
import UsersList from './components/UsersList';
import NavBar from './components/NavBar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/items" element={<ProtectedRoute><ItemsList /></ProtectedRoute>} />
        <Route path="/items/new" element={<ProtectedRoute><ItemForm /></ProtectedRoute>} />
        <Route path="/items/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
        <Route path="/items/:id/edit" element={<ProtectedRoute><ItemForm /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;