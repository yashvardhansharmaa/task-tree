import React, { useState, useCallback } from "react";
import { useApi } from "../../contexts/ApiProvider";
import { useAuth } from "../../contexts/AuthContext";
import { TextField, Button, Box, Alert } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const AddList = ({ onUpdateLists }) => {
    const [listName, setListName] = useState("");
    const [isNameValid, setNameValid] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const api = useApi();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const validateInput = useCallback(() => {
        if (!listName.trim()) {
            setNameValid(false);
            setError('List name cannot be empty');
            return false;
        }
        return true;
    }, [listName]);

    const handleListNameChange = (e) => {
        setNameValid(true);
        setError(null);
        setListName(e.target.value);
    };

    const handleAddList = async (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        if (!validateInput()) return;

        setIsSubmitting(true);
        try {
            const response = await api.post("/lists", {
                name: listName.trim(),
                description: ''
            });

            if (response.ok) {
                setListName("");
                setError(null);
                if (onUpdateLists) await onUpdateLists();
            } else {
                throw new Error(response.body?.message || 'Failed to create list');
            }
        } catch (error) {
            console.error('Error creating list:', error);
            setError(error.message || 'An unexpected error occurred');
            setNameValid(false);

            if (error.status === 401) {
                navigate('/login', { state: { from: location.pathname } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleAddList}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 1.5,
                bgcolor: "#f4f7fa",
                boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
                borderRadius: "5px",
                maxWidth: "600px",
                margin: "0 auto",
                border: "2px solid #ddd"
            }}
        >
            <Box display="flex" gap={2}>
                <TextField
                    variant="outlined"
                    label="List name"
                    value={listName}
                    onChange={handleListNameChange}
                    error={!isNameValid}
                    helperText={!isNameValid ? error : ""}
                    fullWidth
                    size="small"
                    disabled={isSubmitting}
                    inputProps={{
                        maxLength: 100,
                        'aria-label': 'List name'
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                    sx={{
                        height: 40,
                        whiteSpace: 'nowrap',
                        minWidth: '100px'
                    }}
                >
                    {isSubmitting ? 'Adding...' : 'Add List'}
                </Button>
            </Box>
            {error && (
                <Alert 
                    severity="error" 
                    onClose={() => setError(null)}
                    sx={{ mt: 1 }}
                >
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default AddList;