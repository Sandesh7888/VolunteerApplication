import React from 'react';

const dummyAdminSettings = {
  adminName: 'System Admin',
  email: 'admin@volunteerhub.com',
  phone: '+91 9123456789',
  timezone: 'Asia/Kolkata',
  platformMode: 'Production',
  defaultApprovalFlow: 'Manual Review',
  securityAlerts: true,
  emailReports: true,
  smsAlerts: false,
  auditLogs: true,
};

const AdminSettings = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Admin Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Demo configuration data for admin panel</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Profile</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Admin Name" value={dummyAdminSettings.adminName} />
          <Input label="Email" value={dummyAdminSettings.email} />
          <Input label="Phone" value={dummyAdminSettings.phone} />
          <Input label="Timezone" value={dummyAdminSettings.timezone} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Controls</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Platform Mode" value={dummyAdminSettings.platformMode} />
          <Input label="Approval Flow" value={dummyAdminSettings.defaultApprovalFlow} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Notifications & Security</h2>
        <div className="space-y-3">
          <Toggle label="Security Alerts" enabled={dummyAdminSettings.securityAlerts} />
          <Toggle label="Email Reports" enabled={dummyAdminSettings.emailReports} />
          <Toggle label="SMS Alerts" enabled={dummyAdminSettings.smsAlerts} />
          <Toggle label="Audit Logs" enabled={dummyAdminSettings.auditLogs} />
        </div>
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

export default AdminSettings;
