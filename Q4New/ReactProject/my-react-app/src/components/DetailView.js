// src/components/DetailView.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function DetailView() {
  const { operation, id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', surname: '', email: '', password: '' });
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(operation !== 'new');

  const fetchUser = useCallback(() => {
    setLoading(true);
    setError(null);
    axios.get(`http://localhost:8080/users/${id}`)
      .then(response => {
        setUser({
          name: response.data.name,
          surname: response.data.surname,
          email: response.data.email,
          password: ''
        });
        setLoading(false);
      })
      .catch(() => {
        setError('An error occurred while fetching user details.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (operation === 'edit' || operation === 'delete') {
      fetchUser();
    }
  }, [operation, fetchUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'password') {
      setIsPasswordChanged(true);
    }

    setUser({ ...user, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};

    if (!user.name.trim()) {
      errors.name = 'Name cannot be empty.';
    }

    if (!user.surname.trim()) {
      errors.surname = 'Surname cannot be empty.';
    }

    if (!user.email.trim()) {
      errors.email = 'Email cannot be empty.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (operation === 'new' && !user.password.trim()) {
      errors.password = 'Password cannot be empty.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAction = () => {
    if (!validateForm()) {
      return;
    }

    if (operation === 'new') {
      axios.post('http://localhost:8080/users', user)
        .then(() => {
          navigate('/?success=User created successfully');
        })
        .catch(() => {
          setError('An error occurred while creating the user.');
        });
    } else if (operation === 'edit') {
      const payload = {
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: isPasswordChanged ? user.password : ''
      };
      axios.put(`http://localhost:8080/users/${id}`, payload)
        .then(() => {
          navigate('/?success=User updated successfully');
        })
        .catch(() => {
          setError('An error occurred while updating the user.');
        });
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const getActionText = () => {
    switch (operation) {
      case 'new':
        return 'Create';
      case 'edit':
        return 'Save';
      case 'delete':
        return 'Delete';
      default:
        return 'Action';
    }
  };

  if (loading) {
    return <div className="App"><h2>Loading...</h2></div>;
  }

  if (error) {
    return <div className="App"><h2>{error}</h2></div>;
  }

  return (
    <div className="App container mt-5">
      <h1 className="mb-4">
        {operation === 'new' && 'Create New User'}
        {operation === 'edit' && 'Edit User'}
        {operation === 'delete' && 'Delete User'}
      </h1>
      <form>
        {(operation === 'new' || operation === 'edit') && (
          <>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                id="name"
                name="name"
                value={user.name}
                onChange={handleChange}
              />
              {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="surname" className="form-label">Surname</label>
              <input
                type="text"
                className={`form-control ${fieldErrors.surname ? 'is-invalid' : ''}`}
                id="surname"
                name="surname"
                value={user.surname}
                onChange={handleChange}
              />
              {fieldErrors.surname && <div className="invalid-feedback">{fieldErrors.surname}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={user.email}
                onChange={handleChange}
              />
              {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                id="password"
                name="password"
                value={user.password}
                onChange={handleChange}
              />
              {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
            </div>
          </>
        )}
        {error && <div className="alert alert-danger">{error}</div>}
        <button
          type="button"
          className={`btn ${operation === 'delete' ? 'btn-danger' : 'btn-primary'} me-2`}
          onClick={handleAction}
        >
          {getActionText()}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleBack}
        >
          Back
        </button>
      </form>
    </div>
  );
}

export default DetailView;
