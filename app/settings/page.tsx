"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    reminderAlerts: true,
    emergencyAlerts: true,
    language: "en",
    theme: "dark",
    twoFactor: false,
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passError, setPassError] = useState("");
  const [passSaved, setPassSaved] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleSaveSettings = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = async () => {
    setPassError("");
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPassError("All fields required!");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPassError("New passwords don't match!");
      return;
    }
    if (passwords.new.length < 6) {
      setPassError("Password must be at least 6 characters!");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setPassSaved(true);
    setPasswords({ current: "", new: "", confirm: "" });
    setTimeout(() => setPassSaved(false), 3000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
        value ? "bg-teal-500" : "bg-gray-700"
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${
        value ? "left-6" : "left-0.5"
      }`} />
    </button>
  );

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors text-sm";

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
          <span>⚙️</span>
        </div>
        <div>
          <h1 className="text-white font-bold">Settings</h1>
          <p className="text-teal-400 text-xs">Manage your preferences</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* Account Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>👤</span> Account Information
          </h3>
          <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
            <div className="bg-teal-500/20 border border-teal-500/30 rounded-full px-3 py-1">
              <span className="text-teal-400 text-xs font-medium">{user?.plan} Plan</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>🔔</span> Notifications
          </h3>
          <div className="space-y-4">
            {[
              { key: "emailNotifications", label: "Email Notifications", desc: "Receive consultation summaries via email" },
              { key: "pushNotifications", label: "Push Notifications", desc: "Browser push notifications" },
              { key: "reminderAlerts", label: "Reminder Alerts", desc: "Medication and exercise reminders" },
              { key: "emergencyAlerts", label: "Emergency Alerts", desc: "Critical health warnings" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
                <Toggle
                  value={settings[item.key as keyof typeof settings] as boolean}
                  onChange={() => setSettings({...settings, [item.key]: !settings[item.key as keyof typeof settings]})}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>🎨</span> Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select
                value={settings.language}
                onChange={e => setSettings({...settings, language: e.target.value})}
                className={inputClass}
              >
                <option value="en">English</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={e => setSettings({...settings, theme: e.target.value})}
                className={inputClass}
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>🔒</span> Security
          </h3>

          <div className="flex items-center justify-between mb-6 py-2">
            <div>
              <p className="text-white text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-gray-500 text-xs">Add extra security to your account</p>
            </div>
            <Toggle
              value={settings.twoFactor}
              onChange={() => setSettings({...settings, twoFactor: !settings.twoFactor})}
            />
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-3">
            <h4 className="text-white text-sm font-medium">Change Password</h4>
            {passError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-xs">{passError}</p>
              </div>
            )}
            {passSaved && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <p className="text-green-400 text-xs">✅ Password changed successfully!</p>
              </div>
            )}
            <input
              type="password"
              value={passwords.current}
              onChange={e => setPasswords({...passwords, current: e.target.value})}
              placeholder="Current password"
              className={inputClass}
            />
            <input
              type="password"
              value={passwords.new}
              onChange={e => setPasswords({...passwords, new: e.target.value})}
              placeholder="New password"
              className={inputClass}
            />
            <input
              type="password"
              value={passwords.confirm}
              onChange={e => setPasswords({...passwords, confirm: e.target.value})}
              placeholder="Confirm new password"
              className={inputClass}
            />
            <button
              onClick={handleChangePassword}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-6">
          <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
            <span>⚠️</span> Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Delete Account</p>
              <p className="text-gray-500 text-xs">Permanently delete your account and all data</p>
            </div>
            <button className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm transition-colors">
              Delete Account
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {loading ? "Saving..." : saved ? "✅ Settings Saved!" : "Save Settings"}
        </button>

      </div>
    </div>
  );
}