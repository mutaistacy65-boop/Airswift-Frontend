import { useEffect, useState } from "react";
import API from '@/services/apiClient';

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    skills: "",
    experience: "",
  });
  const [loadingCV, setLoadingCV] = useState(false);
  const [saving, setSaving] = useState(false);

  // Calculate profile completion
  const calculateCompletion = () => {
    const fields = [form.name, form.phone, form.location, form.skills, form.experience];
    const filledFields = fields.filter(field => field && field.trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completion = calculateCompletion();

  // Get missing fields
  const getMissingFields = () => {
    const missingFields = [];
    if (!form.phone || form.phone.trim() === "") missingFields.push("Phone");
    if (!form.location || form.location.trim() === "") missingFields.push("Location");
    if (!form.skills || form.skills.trim() === "") missingFields.push("Skills");
    return missingFields;
  };

  const missingFields = getMissingFields();

  // LOAD PROFILE DATA ON PAGE LOAD
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/profile')
        setForm(res.data || {})
      } catch (err) {
        console.error('Failed to load profile:', err)
      }
    }

    fetchProfile()
  }, [])

  // HANDLE CV UPLOAD + AUTO-FILL
  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingCV(true);
    try {
      const formData = new FormData();
      formData.append("cv", file);

      const res = await API.post('/users/parse-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 🔥 AUTO-FILL FORM
      setForm((prev) => ({
        ...prev,
        name: res.data.name || prev.name,
        phone: res.data.phone || prev.phone,
        skills: res.data.skills?.join(", ") || prev.skills,
        experience: res.data.experience || prev.experience,
      }));
    } catch (error) {
      console.error("CV upload error:", error);
    } finally {
      setLoadingCV(false);
    }
  };

  // SAVE PROFILE
  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post('/profile', form)
      alert('✅ Profile saved successfully')
    } catch (err) {
      console.error('Failed to save profile:', err)
      alert('❌ Failed to save profile')
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* PROGRESS BAR UI */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Profile Completion</span>
          <span className="text-sm font-bold">{completion}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>

        {completion < 100 && (
          <p className="text-xs text-gray-500 mt-2">
            Complete your profile to increase your chances of getting hired 🚀
          </p>
        )}

        {missingFields.length > 0 && (
          <p className="text-xs text-red-500 mt-2">
            Missing: {missingFields.join(", ")}
          </p>
        )}
      </div>

      <form className="bg-white p-6 rounded shadow">
        <div className="space-y-4">
          {/* CV UPLOAD SECTION */}
          <div>
            <label className="block text-sm font-medium mb-1">📄 Upload CV (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleCVUpload}
              disabled={loadingCV}
              className="w-full p-2 border rounded"
            />
            {loadingCV && <p className="text-sm text-blue-600 mt-2">🔍 Extracting CV data...</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skills</label>
            <input
              type="text"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="e.g., JavaScript, React, Node.js"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Experience</label>
            <textarea
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Describe your work experience..."
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '💾 Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
