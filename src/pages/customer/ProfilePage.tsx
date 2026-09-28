import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Address } from '../../types';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');

  // Profile Update State
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Address Book State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await api.get('/orders/addresses');
      setAddresses(res.data);
    } catch {
      // ignore
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await api.put('/auth/profile', { name });
      // Update local auth context
      login(res.data.token, res.data);
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setProfileMsg({
        text: err.response?.data?.message || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to change password.',
        type: 'error',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await api.post('/orders/addresses', newAddress);
      setShowAddAddressModal(false);
      setNewAddress({
        fullName: '',
        addressLine: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
      });
      fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/orders/addresses/${id}`);
      fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await api.put(`/orders/addresses/${id}/default`);
      fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to set default address.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal credentials, address book, and security settings
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Link
            to="/orders"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            View Order History
          </Link>
          <Link
            to="/wishlist"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
          >
            My Wishlist
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mt-6 gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'addresses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Address Book ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Password & Security
        </button>
      </div>

      {/* TAB 1: Profile Details */}
      {activeTab === 'profile' && (
        <div className="mt-8 max-w-xl bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">Edit Profile</h2>

          {profileMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium mb-4 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Email address is permanently linked to your EasyShop account.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Role</label>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                {user?.role}
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm disabled:bg-slate-300"
            >
              {savingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Address Book */}
      {activeTab === 'addresses' && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Saved Delivery Addresses</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set a default address to auto-populate shipping info during checkout
              </p>
            </div>
            <button
              onClick={() => setShowAddAddressModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
            >
              + Add New Address
            </button>
          </div>

          {loadingAddresses ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-600">No saved addresses yet.</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Add an address to make checkout faster on future orders.
              </p>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
              >
                Add Address Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {addresses.map((addr) => (
                <div
                  key={addr.addressID}
                  className={`bg-white p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                    addr.isDefault
                      ? 'border-indigo-500 ring-2 ring-indigo-50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {addr.addressLine}
                      <br />
                      {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-mono">📞 {addr.phone}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => handleSetDefaultAddress(addr.addressID)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Primary shipping</span>
                    )}

                    <button
                      onClick={() => handleDeleteAddress(addr.addressID)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Address Modal */}
          {showAddAddressModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-800 text-base">Add New Address</h3>
                  <button
                    onClick={() => setShowAddAddressModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddAddress} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.addressLine}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, addressLine: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        PIN / Zip Code
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddAddressModal(false)}
                      className="w-1/2 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition disabled:bg-slate-300"
                    >
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Password & Security */}
      {activeTab === 'security' && (
        <div className="mt-8 max-w-xl bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-1">Change Account Password</h2>
          <p className="text-xs text-slate-500 mb-4">
            Keep your credentials safe by updating your password periodically
          </p>

          {passwordMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium mb-4 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="mt-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm disabled:bg-slate-300"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
