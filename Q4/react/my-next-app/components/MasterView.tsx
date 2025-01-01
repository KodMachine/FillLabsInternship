"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  created_at: string;
}

const MasterView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch {
      setError('An error occurred while fetching users.');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    router.push('/detail/new');
  };

  const handleEdit = () => {
    if (!selectedUserId) return;
    router.push(`/detail/edit/${selectedUserId}`);
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;
    try {
      await axios.delete(`/api/users/${selectedUserId}`);
      fetchUsers();
      router.push('/?status=success&message=User deleted successfully');
    } catch {
      router.push('/?status=error&message=An error occurred while deleting user');
    }
  };

  return (
    <div className="container mt-5">
      {status && (
        <div
          className={`alert ${
            status === 'success' ? 'alert-success' : 'alert-danger'
          }`}
          role="alert"
        >
          {message}
        </div>
      )}
      <h1 className="text-center mb-4">User List</h1>
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className={user.id === selectedUserId ? 'table-primary' : ''}
              onClick={() => setSelectedUserId(user.id)}
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
      <div className="d-flex justify-content-center mt-4">
        <button className="btn btn-success me-2" onClick={handleNew}>
          New
        </button>
        <button
          className="btn btn-primary me-2"
          onClick={handleEdit}
          disabled={!selectedUserId}
        >
          Edit
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={!selectedUserId}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default MasterView;
