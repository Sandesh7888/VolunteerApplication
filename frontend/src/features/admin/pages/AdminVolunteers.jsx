import React, { useState, useEffect } from 'react';
import { useApi } from '../../../useApi';
import { 
  Users, Mail, Phone, Search, Loader2, MailPlus, Trash2, Plus, X, Save, Edit2, Eye 
} from 'lucide-react';

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    password: '',
  });
  
  const { apiCall } = useApi();

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/users/role/VOLUNTEER');
      setVolunteers(data || []);
    } catch (err) {
      console.error('Fetch volunteers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (volunteer = null) => {
    if (volunteer) {
      setEditingVolunteer(volunteer);
      setFormData({
        name: volunteer.name || '',
        email: volunteer.email || '',
        number: volunteer.number || '',
        password: '',
      });
    } else {
      setEditingVolunteer(null);
      setFormData({
        name: '',
        email: '',
        number: '',
        password: 'Password123!',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingVolunteer) {
        await apiCall(`/users/${editingVolunteer.id}`, {
          method: 'PUT',
          body: {
            ...editingVolunteer,
            name: formData.name,
            number: formData.number,
          }
        });
      } else {
        await apiCall('/users', {
          method: 'POST',
          body: {
            name: formData.name,
            email: formData.email,
            number: formData.number,
            password: formData.password,
            role: 'VOLUNTEER'
          }
        });
      }
      setIsModalOpen(false);
      fetchVolunteers();
      alert(`✅ Volunteer ${editingVolunteer ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      console.error('Save volunteer error:', err);
      alert('❌ Failed to save volunteer: ' + (err.message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this volunteer?')) return;
    try {
      await apiCall(`/users/${id}`, { method: 'DELETE' });
      setVolunteers(volunteers.filter(v => v.id !== id));
      alert('✅ Volunteer removed successfully!');
    } catch (err) {
      console.error('Delete volunteer error:', err);
      alert('❌ Failed to delete volunteer: ' + (err.message || 'Server error'));
    }
  };

  const filteredVolunteers = volunteers.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.number?.toString().includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER SECTION - Same as Events.jsx */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Our Volunteers</h1>
            <p className="text-lg text-gray-500 font-medium">Platform Members • {volunteers.length} Total</p>
          </div>
          
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus size={20} />
              Add Volunteer
            </button>
          </div>
        </div>
      </div>

      {/* VOLUNTEERS TABLE - Simple style as requested */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading volunteers repository...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Volunteer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                      No matching volunteers found.
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{v.name}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">ID: #{v.id}</div>
                      </td>
                      
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {v.email}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {v.number || 'N/A'}
                      </td>

                      <td className="px-6 py-4">
                         {v.documentsVerified ? (
                           <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                             Verified
                           </span>
                         ) : (
                           <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
                             Unverified
                           </span>
                         )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => window.location.href = `/admin/volunteers/${v.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Profile"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(v)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(v.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL - Simplified consistent style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black text-gray-900">
                  {editingVolunteer ? 'Update Member' : 'New Volunteer'}
               </h2>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X className="w-6 h-6 text-gray-400" />
               </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-xs font-black uppercase tracking-widest px-1 ${editingVolunteer ? 'text-amber-500' : 'text-gray-400'}`}>
                  Email Address {editingVolunteer && '(Fixed)'}
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingVolunteer}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none disabled:text-gray-400"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              {!editingVolunteer && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Create Password</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div className="pt-4">
                 <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                 >
                   {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                   {editingVolunteer ? 'Save Changes' : 'Register Member'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
