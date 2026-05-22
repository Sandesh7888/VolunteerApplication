import React from 'react';

const dummySettings = {
  fullName: 'Sunil Mahajan',
  email: 'sunilmahajan7472@gmail.com',
  phone: '+91 9876543210',
  city: 'Pune',
  availability: 'Weekends',
  language: 'English, Hindi',
  emailNotifications: true,
  smsNotifications: false,
  eventReminders: true,
  profileVisibility: 'Public',
};

const VolunteerSettings = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Demo data preview for volunteer preferences</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Full Name" value={dummySettings.fullName} />
          <Input label="Email" value={dummySettings.email} />
          <Input label="Phone" value={dummySettings.phone} />
          <Input label="City" value={dummySettings.city} />
          <Input label="Availability" value={dummySettings.availability} />
          <Input label="Languages" value={dummySettings.language} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Notifications</h2>
        <div className="space-y-3">
          <Toggle label="Email Notifications" enabled={dummySettings.emailNotifications} />
          <Toggle label="SMS Notifications" enabled={dummySettings.smsNotifications} />
          <Toggle label="Event Reminders" enabled={dummySettings.eventReminders} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Privacy</h2>
        <Input label="Profile Visibility" value={dummySettings.profileVisibility} />
      </div>
    </div>
  );
};

const Input = ({ label, value }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
    <input
      value={value}
      readOnly
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-medium"
    />
  </div>
);

const Toggle = ({ label, enabled }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
    <span className="text-sm font-semibold text-gray-800">{label}</span>
    <span
      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
        enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
      }`}
    >
      {enabled ? 'On' : 'Off'}
    </span>
  </div>
);

export default VolunteerSettings;
