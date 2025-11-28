import React, { useState } from 'react';
import { User } from '../types';
import { X, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfilePasswordModalProps {
  user: User;
  onClose: () => void;
  onChangePassword: (userId: string, oldPass: string, newPass: string) => { success: boolean; message: string };
}

const ProfilePasswordModal: React.FC<ProfilePasswordModalProps> = ({ user, onClose, onChangePassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const result = onChangePassword(user.id, currentPassword, newPassword);
    if (result.success) {
      setSuccess(result.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(onClose, 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-zoom-in relative border border-slate-200 dark:border-slate-700">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300">
          <X size={24} />
        </button>
        <div className="text-center">
            <KeyRound size={32} className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/50 p-3 rounded-full mx-auto mb-4 border-8 border-emerald-100 dark:border-emerald-900/50" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Change Password</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Update the password for your account: <strong>{user.username}</strong></p>
        </div>

        {success ? (
          <div className="mt-6 text-center p-4 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} />
            <span className="font-medium">{success}</span>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                <button type="button" tabIndex={-1} onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
               <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                <button type="button" tabIndex={-1} onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showNew ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2"><AlertCircle size={16}/>{error}</p>
            )}
            
            <button type="submit" className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors">Update Password</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfilePasswordModal;
