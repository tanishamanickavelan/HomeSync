import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, familyAPI } from '../services/api';
import { Toast } from '../components/common/index';
import useToast from '../hooks/useToast';
import { UserCircleIcon, HomeIcon, KeyIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [familyForm, setFamilyForm] = useState({ family_name: user?.family_id?.family_name || '', city: user?.family_id?.city || '' });
  const [joinCode, setJoinCode] = useState('');
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      showToast('Profile updated!', 'success');
    } catch { showToast('Failed to update profile', 'error'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      showToast('Password changed!', 'success');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { showToast(err.response?.data?.message || 'Failed to change password', 'error'); }
    finally { setSaving(false); }
  };

  const handleFamilySave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await familyAPI.update(familyForm);
      await refreshUser();
      showToast('Family updated!', 'success');
    } catch { showToast('Failed to update family', 'error'); }
    finally { setSaving(false); }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await familyAPI.join(joinCode);
      await refreshUser();
      showToast('Joined family successfully!', 'success');
      setJoinCode('');
    } catch (err) { showToast(err.response?.data?.message || 'Invalid invite code', 'error'); }
    finally { setSaving(false); }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(user?.family_id?.invite_code || '');
    showToast('Invite code copied!', 'info');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'family', label: 'Family', icon: HomeIcon },
    { id: 'security', label: 'Security', icon: KeyIcon },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in">
      <div>
        <h1 className="page-title">Account Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your profile and family</p>
      </div>

      {/* User card */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-display text-lg font-bold text-white">{user?.name}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user?.role === 'admin' ? 'bg-teal-500/15 text-teal-400' : 'bg-slate-700 text-slate-400'}`}>
              {user?.role}
            </span>
            {user?.family_id && (
              <span className="text-xs text-slate-500">🏠 {user.family_id.family_name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="card animate-in">
          <h2 className="section-title mb-4">Personal Information</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                className="input" placeholder="Your full name" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input value={user?.email} className="input opacity-50 cursor-not-allowed" disabled />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                className="input" placeholder="+91 99999 99999" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Family tab */}
      {activeTab === 'family' && (
        <div className="space-y-4 animate-in">
          {user?.family_id ? (
            <div className="card">
              <h2 className="section-title mb-4">Family Details</h2>
              {/* Invite code */}
              <div className="flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl mb-4">
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">Invite Code</p>
                  <p className="font-display text-xl font-bold text-teal-400 tracking-widest">{user.family_id.invite_code}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Share this with family members to join</p>
                </div>
                <button onClick={copyInviteCode} className="p-2 hover:bg-teal-500/20 rounded-lg text-teal-400 transition-all">
                  <ClipboardDocumentIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleFamilySave} className="space-y-4">
                <div>
                  <label className="label">Family Name</label>
                  <input value={familyForm.family_name} onChange={e => setFamilyForm(p => ({ ...p, family_name: e.target.value }))}
                    className="input" placeholder="The Sharma Family" required />
                </div>
                <div>
                  <label className="label">City</label>
                  <input value={familyForm.city} onChange={e => setFamilyForm(p => ({ ...p, city: e.target.value }))}
                    className="input" placeholder="Chennai" />
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
                  {saving ? 'Saving...' : 'Update Family'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card">
              <h2 className="section-title mb-2">Join a Family</h2>
              <p className="text-slate-400 text-sm mb-4">Enter the invite code from your family admin</p>
              <form onSubmit={handleJoinFamily} className="space-y-3">
                <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  className="input uppercase tracking-widest text-center text-lg font-display" placeholder="INVITE CODE" required />
                <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
                  {saving ? 'Joining...' : 'Join Family'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="card animate-in">
          <h2 className="section-title mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" value={passForm.currentPassword}
                onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))}
                className="input" placeholder="••••••••" required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" value={passForm.newPassword}
                onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
                className="input" placeholder="At least 6 characters" minLength={6} required />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" value={passForm.confirmPassword}
                onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className="input" placeholder="Repeat new password" required />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};

export default ProfilePage;
