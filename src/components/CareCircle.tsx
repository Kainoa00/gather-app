'use client'

import { useState } from 'react'
import {
  Users,
  UserPlus,
  Shield,
  Eye,
  Edit3,
  Phone,
  Mail,
  Copy,
  Check,
  X
} from 'lucide-react'
import { CareCircleMember, UserRole } from '@/types'

interface CareCircleProps {
  members: CareCircleMember[]
  onAddMember: (member: Omit<CareCircleMember, 'id' | 'joinedAt'>) => void
}

const roleConfig = {
  admin: {
    label: 'Admin',
    description: 'Full edit rights',
    icon: Edit3,
    color: 'bg-primary-100 text-primary-700',
  },
  team: {
    label: 'Team',
    description: 'Can view and claim tasks',
    icon: Users,
    color: 'bg-sage-100 text-sage-700',
  },
  viewer: {
    label: 'Viewer',
    description: 'View only (no medical info)',
    icon: Eye,
    color: 'bg-cream-200 text-warm-700',
  },
}

export default function CareCircle({ members, onAddMember }: CareCircleProps) {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'team' as UserRole,
  })

  const generateInviteLink = () => {
    const link = `https://gather.app/invite/${Math.random().toString(36).substring(7)}`
    setInviteLink(link)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = () => {
    if (newMember.name && newMember.email) {
      onAddMember(newMember)
      setNewMember({ name: '', email: '', phone: '', role: 'team' })
      setShowInviteModal(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-warm-900">Care Circle</h2>
          <p className="text-warm-600 mt-1">
            Manage your caregiving team and their permissions
          </p>
        </div>
        <button
          onClick={() => {
            setShowInviteModal(true)
            generateInviteLink()
          }}
          className="flex items-center px-5 py-2.5 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-all duration-200 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Invite Member
        </button>
      </div>

      {/* Role Legend */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-cream-200">
        <h3 className="text-sm font-medium text-warm-700 mb-3">Permission Levels</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(roleConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <div key={key} className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                  <Icon className="h-3.5 w-3.5 mr-1" />
                  {config.label}
                </span>
                <span className="ml-2 text-sm text-warm-500">{config.description}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Members List */}
      <div className="grid gap-4 md:grid-cols-2">
        {members.map((member) => {
          const role = roleConfig[member.role]
          const RoleIcon = role.icon
          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-cream-200 hover:shadow-warm hover:border-primary-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-warm-900">{member.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${role.color} mt-1`}>
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {role.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center text-sm text-warm-600 hover:text-primary-600 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {member.email}
                </a>
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center text-sm text-warm-600 hover:text-primary-600 transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {member.phone}
                  </a>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-cream-100">
                <p className="text-xs text-warm-400">
                  Joined {member.joinedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-warm-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-warm-900">Invite to Care Circle</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-warm-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Role
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="team">Team - Can view and claim tasks</option>
                  <option value="viewer">Viewer - View only (no medical info)</option>
                </select>
              </div>

              {/* Invite Link */}
              <div className="bg-cream-50 rounded-2xl p-4">
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Or share invite link via SMS
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2.5 bg-white border border-cream-200 rounded-xl text-sm text-warm-600"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2.5 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 transition-colors"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2.5 border border-cream-200 text-warm-700 rounded-xl hover:bg-cream-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-warm"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
