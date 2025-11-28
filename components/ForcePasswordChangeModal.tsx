import React, { useState } from 'react';
import { User } from '../types';
import { X, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface ForcePasswordChangeModalProps {
  user: User;
  onPasswordChanged: (newPass: string) => void;
}

const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({ user, onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    onPasswordChanged(newPassword);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-zoom-in relative border border-slate-200 dark:border-slate-700">
        <div className="text-center">
            <KeyRound size={32} className="text-orange-500 bg-orange-50 dark:bg-orange-900/50 p-3 rounded-full mx-auto mb-4 border-8 border-orange-100 dark:border-orange-900/50" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Password Change Required</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">An administrator has required you to change the password for your account: <strong>{user.username}</strong>. Please set a new password to continue.</p>
        </div>

        <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
               <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2"><AlertCircle size={16}/>{error}</p>
            )}
            
            <button type="submit" className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors">Set New Password & Continue</button>
          </div>
      </form>
    </div>
  );
};

export default ForcePasswordChangeModal;
