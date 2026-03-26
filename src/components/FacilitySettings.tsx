'use client'

import { useState } from 'react'
import { Building2, Bell, Users, Save, X, Mail, Plus, Shield } from 'lucide-react'
import { UserRole } from '@/types'

type SettingsTab = 'profile' | 'notifications' | 'team'

interface StaffMember {
  id: string
  name: string
  email: string
  role: UserRole
}

const DEMO_STAFF: StaffMember[] = [
  { id: 'a1', name: 'Mary Wilson', email: 'mary.wilson@carebridge.com', role: 'admin' },
  { id: 'n1', name: 'Jane Doe', email: 'jane.doe@carebridge.com', role: 'nurse' },
  { id: 'n2', name: 'Sarah Chen', email: 'sarah.chen@carebridge.com', role: 'nurse' },
]

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  admin: 'bg-amber-100 text-amber-700',
  nurse: 'bg-blue-100 text-blue-700',
  primary: 'bg-green-100 text-green-700',
  family: 'bg-purple-100 text-purple-700',
}

export default function FacilitySettings() {
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('profile')

  // Facility profile state
  const [facilityName, setFacilityName] = useState('Sunrise Care Facility')
  const [facilityPhone, setFacilityPhone] = useState('(808) 555-0100')
  const [facilityAddress, setFacilityAddress] = useState('123 Care Lane, Honolulu, HI 96815')
  const [numberOfBeds, setNumberOfBeds] = useState(48)
  const [profileSaved, setProfileSaved] = useState(false)

  // Notification preferences state
  const [emailOnCareLog, setEmailOnCareLog] = useState(true)
  const [dailyDigest, setDailyDigest] = useState(true)
  const [notifyNewFamily, setNotifyNewFamily] = useState(true)

  // Team management state
  const [staff, setStaff] = useState<StaffMember[]>(DEMO_STAFF)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'nurse' | 'admin'>('nurse')
  const [inviteSent, setInviteSent] = useState(false)

  const handleSaveProfile = () => {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return
    const newMember: StaffMember = {
      id: crypto.randomUUID(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
    }
    setStaff([...staff, newMember])
    setInviteSent(true)
    setTimeout(() => {
      setInviteSent(false)
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('nurse')
    }, 2000)
  }

  const settingsTabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
    { id: 'profile', label: 'Facility Profile', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Facility Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your facility configuration and team</p>
      </div>

      {/* Settings Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 flex-wrap">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSettingsTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                activeSettingsTab === tab.id
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Facility Profile Tab */}
      {activeSettingsTab === 'profile' && (
        <div className="card-glass p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Facility Profile</h3>
          <div className="space-y-5 max-w-xl">
            <div>
              <label htmlFor="facility-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Facility Name
              </label>
              <input
                id="facility-name"
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="facility-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                Facility Phone
              </label>
              <input
                id="facility-phone"
                type="tel"
                value={facilityPhone}
                onChange={(e) => setFacilityPhone(e.target.value)}
                className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="facility-address" className="block text-sm font-medium text-slate-700 mb-1.5">
                Facility Address
              </label>
              <input
                id="facility-address"
                type="text"
                value={facilityAddress}
                onChange={(e) => setFacilityAddress(e.target.value)}
                className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="bed-count" className="block text-sm font-medium text-slate-700 mb-1.5">
                Number of Beds
              </label>
              <input
                id="bed-count"
                type="number"
                value={numberOfBeds}
                onChange={(e) => setNumberOfBeds(parseInt(e.target.value) || 0)}
                className="w-32 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Facility Logo
              </label>
              <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400 bg-slate-50">
                Upload logo
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 min-h-[44px] px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              {profileSaved && (
                <p className="mt-2 text-sm text-green-600 font-medium">Settings saved successfully.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Tab */}
      {activeSettingsTab === 'notifications' && (
        <div className="card-glass p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Notification Preferences</h3>
          <div className="space-y-5 max-w-xl">
            <ToggleRow
              label="Send email to family when care log entry is added"
              description="Family members receive an email notification for each new care log entry."
              checked={emailOnCareLog}
              onChange={setEmailOnCareLog}
            />
            <ToggleRow
              label="Send daily digest email to primary family member"
              description="A summary of the day's care entries is emailed each evening."
              checked={dailyDigest}
              onChange={setDailyDigest}
            />
            <ToggleRow
              label="Notify admin when new family member joins"
              description="Admins receive a notification when a new family member is added to a care circle."
              checked={notifyNewFamily}
              onChange={setNotifyNewFamily}
            />
          </div>
        </div>
      )}

      {/* Team Management Tab */}
      {activeSettingsTab === 'team' && (
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Team Members</h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Invite Staff Member
            </button>
          </div>

          <div className="space-y-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                  <p className="text-xs text-slate-400 truncate">{member.email}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ROLE_BADGE_STYLES[member.role]}`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Invite Staff Member</h3>
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteEmail('')
                  setInviteSent(false)
                }}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {inviteSent ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Invitation sent!</p>
                <p className="text-xs text-slate-400 mt-1">An invite has been sent to {inviteEmail}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="invite-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="staff@facility.com"
                    className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="invite-role" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Role
                  </label>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'nurse' | 'admin')}
                    className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="nurse">Nurse</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  onClick={handleSendInvite}
                  disabled={!inviteEmail.trim()}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Invite
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Toggle component
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100">
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors min-h-[44px] items-center ${
          checked ? 'bg-primary-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
