"use client";

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface DetailViewProps {
  operation: string;
  id?: string;
}

interface User {
  name: string;
  surname: string;
  email: string;
  password: string;
}

const DetailView: React.FC<DetailViewProps> = ({ operation, id }) => {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    name: '',
    surname: '',
    email: '',
    password: '',
  });
  const [isPasswordChanged, setIsPasswordChanged] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(operation !== 'new');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/users/${id}`);
      setUser({
        name: response.data.name,
        surname: response.data.surname,
        email: response.data.email,
        password: '',
      });
    } catch {
      setError('Error fetching user details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (operation === 'edit') {
      fetchUser();
    }
  }, [operation, fetchUser]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!user.name.trim()) errors.name = 'Name is required.';
    if (!user.surname.trim()) errors.surname = 'Surname is required.';
    if (!user.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(user.email)) {
      errors.email = 'Invalid email format.';
    }
    if (operation === 'new' && !user.password.trim()) {
      errors.password = 'Password is required for new users.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: isPasswordChanged ? user.password : '',
      };

      if (operation === 'new') {
        await axios.post('/api/users', payload);
        router.push('/?status=success&message=User created successfully');
      } else if (operation === 'edit') {
        await axios.put(`/api/users/${id}`, payload);
        router.push('/?status=success&message=User updated successfully');
      }
    } catch {
      router.push('/?status=error&message=An error occurred while saving user');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">
        {operation === 'new' ? 'Create User' : 'Edit User'}
      </h1>
      <form className="needs-validation" noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
            id="name"
            name="name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            placeholder="Enter name"
          />
          {validationErrors.name && <div className="invalid-feedback">{validationErrors.name}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="surname" className="form-label">Surname</label>
          <input
            type="text"
            className={`form-control ${validationErrors.surname ? 'is-invalid' : ''}`}
            id="surname"
            name="surname"
            value={user.surname}
            onChange={(e) => setUser({ ...user, surname: e.target.value })}
            placeholder="Enter surname"
          />
          {validationErrors.surname && <div className="invalid-feedback">{validationErrors.surname}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
            id="email"
            name="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Enter email"
          />
          {validationErrors.email && <div className="invalid-feedback">{validationErrors.email}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
            id="password"
            name="password"
            value={user.password}
            onChange={(e) => {
              setUser({ ...user, password: e.target.value });
              setIsPasswordChanged(true);
            }}
            placeholder={operation === 'new' ? 'Enter password' : 'Leave blank to keep current password'}
          />
          {validationErrors.password && <div className="invalid-feedback">{validationErrors.password}</div>}
        </div>
        <div className="d-flex justify-content-center mt-4">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={handleSubmit}
          >
            {operation === 'new' ? 'Create' : 'Update'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push('/')}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default DetailView;