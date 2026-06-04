"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    bloodGroup: "",
    allergies: "",
    chronicDiseases: "",
    medications: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(userData);
    setUser(u);
    setProfile(prev => ({ ...prev, name: u.name, email: u.email }));
  }, [router]);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-2";

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
          <span>👤</span>
        </div>
        <div>
          <h1 className="text-white font-bold">Health Profile</h1>
          <p className="text-teal-400 text-xs">Manage your health information</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* Avatar */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-6">
          <div className="w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="mt-2 inline-block bg-teal-500/20 border border-teal-500/30 rounded-full px-3 py-1">
              <span className="text-teal-400 text-xs font-medium">{user?.plan} Plan</span>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>📋</span> Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className={inputClass + " opacity-50 cursor-not-allowed"}
              />
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={e => setProfile({...profile, age: e.target.value})}
                placeholder="25"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                value={profile.gender}
                onChange={e => setProfile({...profile, gender: e.target.value})}
                className={inputClass}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Physical Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>⚖️</span> Physical Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Height (cm)</label>
              <input
                type="number"
                value={profile.height}
                onChange={e => setProfile({...profile, height: e.target.value})}
                placeholder="170"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input
                type="number"
                value={profile.weight}
                onChange={e => setProfile({...profile, weight: e.target.value})}
                placeholder="70"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <select
                value={profile.bloodGroup}
                onChange={e => setProfile({...profile, bloodGroup: e.target.value})}
                className={inputClass}
              >
                <option value="">Select</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>O+</option>
                <option>O-</option>
              </select>
            </div>
          </div>

          {/* BMI Calculator */}
          {profile.height && profile.weight && (
            <div className="mt-4 bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
              <p className="text-teal-400 text-sm font-medium">
                BMI: {(parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1)}
                <span className="text-gray-400 font-normal ml-2">
                  {(() => {
                    const bmi = parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2);
                    if (bmi < 18.5) return "— Underweight";
                    if (bmi < 25) return "— Normal ✅";
                    if (bmi < 30) return "— Overweight ⚠️";
                    return "— Obese 🔴";
                  })()}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Medical Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>🏥</span> Medical Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Allergies</label>
              <input
                type="text"
                value={profile.allergies}
                onChange={e => setProfile({...profile, allergies: e.target.value})}
                placeholder="e.g. Penicillin, Peanuts, Dust"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Chronic Diseases</label>
              <input
                type="text"
                value={profile.chronicDiseases}
                onChange={e => setProfile({...profile, chronicDiseases: e.target.value})}
                placeholder="e.g. Diabetes, Hypertension"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Current Medications</label>
              <input
                type="text"
                value={profile.medications}
                onChange={e => setProfile({...profile, medications: e.target.value})}
                placeholder="e.g. Metformin 500mg, Aspirin"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>🚨</span> Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contact Name</label>
              <input
                type="text"
                value={profile.emergencyContact}
                onChange={e => setProfile({...profile, emergencyContact: e.target.value})}
                placeholder="e.g. Father, Spouse"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Contact Phone</label>
              <input
                type="tel"
                value={profile.emergencyPhone}
                onChange={e => setProfile({...profile, emergencyPhone: e.target.value})}
                placeholder="+92 300 1234567"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </span>
          ) : saved ? "✅ Saved!" : "Save Profile"}
        </button>

      </div>
    </div>
  );
}