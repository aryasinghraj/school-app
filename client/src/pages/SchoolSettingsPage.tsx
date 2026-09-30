import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Settings, Save, Building, MapPin, Phone, Mail } from 'lucide-react';

export const SchoolSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [school, setSchool] = useState({
    name: 'Jaipur Public School',
    code: 'JPS-SDG-01',
    location: 'Shri Dungargarh, Rajasthan',
    state: 'Rajasthan',
    country: 'India',
    logoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80',
    phone: '+91 1565 223456',
    email: 'info@jaipurpublicschool.edu.in',
    currency: 'INR',
  });

  useEffect(() => {
    fetchSchool();
  }, []);

  const fetchSchool = async () => {
    try {
      const data = await apiRequest('/school');
      if (data) setSchool(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/school', {
        method: 'PUT',
        body: JSON.stringify(school),
      });
      showToast('success', 'School configuration saved!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-600" />
            School Identity & Settings
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Configure school profile, contact information, branding logo, and regional details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">School Name *</label>
            <input
              type="text"
              value={school.name}
              onChange={(e) => setSchool({ ...school, name: e.target.value })}
              className="w-full p-2.5 border rounded-xl font-bold text-gray-900 text-sm"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">School Code / Affiliation *</label>
            <input
              type="text"
              value={school.code}
              onChange={(e) => setSchool({ ...school, code: e.target.value })}
              className="w-full p-2.5 border rounded-xl font-mono text-xs"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Location / District *</label>
            <input
              type="text"
              value={school.location}
              onChange={(e) => setSchool({ ...school, location: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">State *</label>
            <input
              type="text"
              value={school.state}
              onChange={(e) => setSchool({ ...school, state: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Country *</label>
            <input
              type="text"
              value={school.country}
              onChange={(e) => setSchool({ ...school, country: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Official Contact Phone</label>
            <input
              type="text"
              value={school.phone || ''}
              onChange={(e) => setSchool({ ...school, phone: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Official Contact Email</label>
            <input
              type="email"
              value={school.email || ''}
              onChange={(e) => setSchool({ ...school, email: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">School Logo URL</label>
          <input
            type="text"
            value={school.logoUrl || ''}
            onChange={(e) => setSchool({ ...school, logoUrl: e.target.value })}
            className="w-full p-2.5 border rounded-xl font-mono text-xs"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
