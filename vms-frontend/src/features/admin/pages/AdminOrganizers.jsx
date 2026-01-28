// src/features/admin/pages/AdminOrganizers.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { 
  Users, Mail, Phone, Search, Loader2, ExternalLink, Plus, X, Save, Edit2, Trash2, Calendar 
} from 'lucide-react';

export default function AdminOrganizers() {
  const [organizers, setOrganizers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    password: '',
  });

  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/users/role/ORGANIZER');
      setOrganizers(data || []);
    } catch (err) {
      console.error('Fetch organizers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (organizer = null) => {
    if (organizer) {
      setEditingOrganizer(organizer);
      setFormData({
        name: organizer.name || '',
        email: organizer.email || '',
        number: organizer.number || '',
        password: '',
      });
    } else {
      setEditingOrganizer(null);
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
      if (editingOrganizer) {
        await apiCall(`/users/${editingOrganizer.id}`, {
          method: 'PUT',
          body: {
            ...editingOrganizer,
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
            role: 'ORGANIZER'
          }
        });
      }
      setIsModalOpen(false);
      fetchOrganizers();
      alert(`✅ Organizer ${editingOrganizer ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      console.error('Save organizer error:', err);
      alert('❌ Failed to save organizer: ' + (err.message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this organizer?')) return;
    try {
      await apiCall(`/users/${id}`, { method: 'DELETE' });
      setOrganizers(organizers.filter(o => o.id !== id));
      alert('✅ Organizer removed successfully!');
    } catch (err) {
      console.error('Delete organizer error:', err);
      alert('❌ Failed to delete organizer: ' + (err.message || 'Server error'));
    }
  };

  const filteredOrganizers = organizers.filter(org => 
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.number?.toString().includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER SECTION - Consistent with Events and Volunteers */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Verified Organizers</h1>
            <p className="text-lg text-gray-500 font-medium">Platform Partners • {organizers.length} Total</p>
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus size={20} />
              Add Organizer
            </button>
          </div>
        </div>
      </div>

      {/* ORGANIZERS TABLE - Simple style as requested */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading organizers repository...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Organizer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrganizers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                      No matching organizers found.
                    </td>
                  </tr>
                ) : (
                  filteredOrganizers.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/admin/organizers/${o.id}`)}>
                          {o.name}
                        </div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">ID: #{o.id}</div>
                      </td>
                      
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {o.email}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {o.number || 'N/A'}
                      </td>

                      <td className="px-6 py-4">
                         <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                           Verified
                         </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/admin/organizers/${o.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Events"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(o)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(o.id)}
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
                  {editingOrganizer ? 'Update Partner' : 'New Organizer'}
               </h2>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X className="w-6 h-6 text-gray-400" />
               </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Organization Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Green Earth Org"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-xs font-black uppercase tracking-widest px-1 ${editingOrganizer ? 'text-amber-500' : 'text-gray-400'}`}>
                  Official Email {editingOrganizer && '(Fixed)'}
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingOrganizer}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 outline-none disabled:text-gray-400"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@org.com"
                />
              </div>

              {!editingOrganizer && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Access Password</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Contact Number</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 outline-none"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="office number"
                />
              </div>

              <div className="pt-4">
                 <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                 >
                   {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                   {editingOrganizer ? 'Save Changes' : 'Register Partner'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
