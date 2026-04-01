// src/app/infra/page.tsx
export default function InfraPage() {
  const subprocessors = [
    {
      name: 'Amazon Web Services',
      role: 'Cloud infrastructure, compute, storage, VPC, key management, vulnerability scanning',
      cert: 'SOC 2 Type II',
      baa: true,
      region: 'US-East-1 (data residency enforced)',
    },
    {
      name: 'Twilio',
      role: 'SMS delivery, telephony, inbound STOP/YES handling, opt-out enforcement',
      cert: 'SOC 2 Type II',
      baa: true,
      region: 'US region',
    },
    {
      name: 'PointClickCare',
      role: 'EHR source of truth, bidirectional API, webhook events, chart write-back',
      cert: 'PCC API approved',
      baa: true,
      region: 'US',
    },
    {
      name: 'Drata',
      role: 'Continuous SOC 2 compliance monitoring, control tracking, policy management',
      cert: 'SOC 2 monitoring',
      baa: false,
      region: 'Cloud',
    },
  ]

  const security = [
    { label: 'Encryption in transit', value: 'TLS 1.2+', good: true },
    { label: 'Encryption at rest',    value: 'AES-256', good: true },
    { label: 'Data residency',        value: 'US-only (AWS)', good: true },
    { label: 'MFA enforcement',       value: 'All production access', good: true },
    { label: 'Vulnerability scanning',value: 'AWS Inspector (continuous)', good: true },
    { label: 'Breach notification SLA', value: '60 days from discovery', good: null },
    { label: 'Audit log retention',   value: '6 years (45 CFR §164.530(j))', good: null },
    { label: 'Data deletion (NIST)',  value: 'NIST SP 800-88 compliant', good: true },
  ]

  return (
    <div className="p-6 space-y-4">
      {/* Subprocessors */}
      <div className="card-glass overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">Subprocessors & business associate agreements</h2>
        </div>
        {subprocessors.map(sp => (
          <div key={sp.name} className="flex items-start gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[13px] font-medium">{sp.name}</p>
                {sp.baa && (
                  <span className="text-[10px] font-medium bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">BAA signed</span>
                )}
              </div>
              <p className="text-[12px] text-gray-500">{sp.role}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{sp.region}</p>
            </div>
            <span className="text-[10px] font-medium bg-green-50 text-green-700 rounded px-2 py-0.5 shrink-0">{sp.cert}</span>
          </div>
        ))}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            CareBridge Connect Messaging acts as Business Associate to each SNF. When deployed via PCC marketplace, CareBridge Connect Messaging is a subcontractor — BAA with PCC extends coverage. Subprocessors reviewed annually.
          </p>
        </div>
      </div>

      {/* Security posture */}
      <div className="card-glass overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">Security posture</h2>
        </div>
        <div className="grid grid-cols-2">
          {security.map((s, i) => (
            <div key={s.label} className={`px-5 py-3.5 ${i % 2 === 0 ? 'border-r' : ''} border-b border-gray-50`}>
              <p className="text-[11px] text-gray-400 mb-1">{s.label}</p>
              <div className="flex items-center gap-1.5">
                {s.good !== null && (
                  <div className={`w-1.5 h-1.5 rounded-full ${s.good ? 'bg-green-400' : 'bg-gray-300'}`} />
                )}
                <p className="text-[13px] font-medium text-gray-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
