// src/components/MasterView.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function MasterView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUsers();
    const params = new URLSearchParams(location.search);
    const successMessage = params.get('success');
    if (successMessage) {
      alert(successMessage);
    }
  }, [location]);

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    axios.get('http://localhost:8080/users')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('An error occurred while fetching users.');
        setLoading(false);
      });
  };

  const handleRowClick = (id) => {
    setSelectedUserId(id === selectedUserId ? null : id);
  };

  const handleDelete = () => {
    if (!selectedUserId) return;

    if (!window.confirm('Are you sure you want to delete the selected user?')) {
      return;
    }

    axios.delete(`http://localhost:8080/users/${selectedUserId}`)
      .then(() => {
        fetchUsers();
        setSelectedUserId(null);
        alert('User deleted successfully.');
      })
      .catch(() => {
        setError('An error occurred while deleting the user.');
      });
  };

  const handleNew = () => {
    navigate('/detail/new');
  };

  const handleEdit = () => {
    if (!selectedUserId) return;
    navigate(`/detail/edit/${selectedUserId}`);
  };

  if (loading) {
    return <div className="App"><h2>Loading...</h2></div>;
  }

  if (error) {
    return <div className="App"><h2>{error}</h2></div>;
  }

  return (
    <div className="App container mt-5">
      <h1 className="mb-4">User List</h1>
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr
              key={user.id}
              onClick={() => handleRowClick(user.id)}
              className={user.id === selectedUserId ? 'table-primary' : ''}
              style={{ cursor: 'pointer' }}
            >
              <td>{user.name}</td>
              <td>{user.surname}</td>
              <td>{user.email}</td>
              <td>{new Date(user.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="button-group mt-3">
        <button
          className="btn btn-success me-2"
          onClick={handleNew}
        >
          <i className="fas fa-save me-1"></i> New
        </button>
        <button
          className="btn btn-primary me-2"
          onClick={handleEdit}
          disabled={!selectedUserId}
        >
          <i className="fas fa-cog me-1"></i> Edit
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={!selectedUserId}
        >
          <i className="fas fa-trash-alt me-1"></i> Delete
        </button>
      </div>
    </div>
  );
}

export default MasterView;
