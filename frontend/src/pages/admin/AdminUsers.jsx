import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'MODERATOR' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/list');
      setUsers(res.data);
    } catch (err) {
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, role) => {
    if (role === 'SUPERADMIN') return;
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      await api.delete(`/admin/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleEdit = async (id, currentName) => {
    const newName = window.prompt("Enter new name:", currentName);
    if (!newName || newName === currentName) return;
    try {
      await api.put(`/admin/${id}`, { name: newName });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/register', newAdmin);
      setShowModal(false);
      setNewAdmin({ name: '', email: '', password: '', role: 'MODERATOR' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-secondary font-bold tracking-widest uppercase">Loading Users...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">User Management</h1>
          <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
          <p className="text-secondary font-bold text-[10px] uppercase tracking-widest leading-relaxed">
            Manage administrator accounts and permissions
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Admin
        </Button>
      </div>

      <Table headers={['Name', 'Email', 'Role', 'Actions']}>
        {users.map(u => (
          <tr key={u.id} className="hover:bg-surface-container-lowest/50 transition-colors">
            <td className="px-6 py-4 font-bold text-on-surface uppercase tracking-tight">{u.name}</td>
            <td className="px-6 py-4 text-on-surface-variant font-semibold">{u.email}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-[0.2em] ${u.role === 'SUPERADMIN' ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                {u.role}
              </span>
            </td>
            <td className="px-6 py-4 text-right space-x-3">
              <button 
                onClick={() => handleEdit(u.id, u.name)} 
                disabled={u.role === 'SUPERADMIN'}
                className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${u.role === 'SUPERADMIN' ? 'text-outline-variant cursor-not-allowed opacity-50' : 'text-primary hover:text-primary/80'}`}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(u.id, u.role)} 
                disabled={u.role === 'SUPERADMIN'}
                className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${u.role === 'SUPERADMIN' ? 'text-outline-variant cursor-not-allowed opacity-50' : 'text-error hover:text-error/80'}`}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        {users.length === 0 && (
          <tr>
            <td colSpan="4" className="px-6 py-8 text-center text-secondary font-bold tracking-widest uppercase text-xs">No users found</td>
          </tr>
        )}
      </Table>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
              <h3 className="font-extrabold uppercase tracking-tight text-on-surface">Add New Administrator</h3>
              <button onClick={() => setShowModal(false)} className="text-secondary hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="p-6 space-y-5 flex flex-col">
              <Input
                label="Name"
                required
                value={newAdmin.name}
                onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={newAdmin.email}
                onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
              <Input
                label="Password"
                type="password"
                required
                value={newAdmin.password}
                onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                className="font-mono text-sm tracking-widest"
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-1">Role</label>
                <select 
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold uppercase tracking-widest text-on-surface appearance-none cursor-pointer"
                  value={newAdmin.role}
                  onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
                >
                  <option value="MODERATOR">Moderator</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3 justify-end border-t border-outline-variant/20">
                 <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                 <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting ? 'Creating...' : 'Create Admin'}
                 </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
