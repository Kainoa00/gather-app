'use client'

import { useState } from 'react'
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Copy,
  Check,
  X,
  Stethoscope,
  Heart,
  Shield,
} from 'lucide-react'
import { CareCircleMember, UserRole } from '@/types'

interface CareCircleProps {
  members: CareCircleMember[]
  onAddMember: (member: Omit<CareCircleMember, 'id' | 'joinedAt'>) => void
}

const roleConfig = {
  admin: {
    label: 'Admin',
    color: 'bg-lavender-100 text-lavender-700',
    gradient: 'from-lavender-400 to-peach-400',
    icon: Shield,
  },
  nurse: {
    label: 'Staff',
    color: 'bg-mint-100 text-mint-700',
    gradient: 'from-mint-400 to-mint-500',
    icon: Stethoscope,
  },
  family: {
    label: 'Family',
    color: 'bg-peach-100 text-peach-700',
    gradient: 'from-lavender-400 to-lavender-500',
    icon: Heart,
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
    role: 'family' as UserRole,
    relationship: '',
  })

  const familyMembers = members.filter((m) => m.role !== 'nurse')
  const staffMembers = members.filter((m) => m.role === 'nurse')

  const generateInviteLink = () => {
    const link = `https://gatherin.app/invite/${Math.random().toString(36).substring(7)}`
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
      setNewMember({ name: '', email: '', phone: '', role: 'family', relationship: '' })
      setShowInviteModal(false)
    }
  }

  const renderMemberCard = (member: CareCircleMember) => {
    const role = roleConfig[member.role]
    const RoleIcon = role.icon
    return (
      <div key={member.id}
        className="card-glass p-5 hover:shadow-float transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-soft flex-shrink-0`}>
            <span className="text-white font-semibold text-lg">
              {member.name.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-navy-900">{member.name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
                <RoleIcon className="h-3 w-3 mr-1" />
                {role.label}
              </span>
            </div>
            {member.relationship && (
              <p className="text-sm text-navy-500 mt-0.5">{member.relationship}</p>
            )}
            <div className="mt-3 space-y-1.5">
              <a href={`mailto:${member.email}`}
                className="flex items-center text-sm text-navy-600 hover:text-lavender-600 transition-colors">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                {member.email}
              </a>
              {member.phone && (
                <a href={`tel:${member.phone}`}
                  className="flex items-center text-sm text-navy-600 hover:text-lavender-600 transition-colors">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  {member.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Care Circle</h2>
          <p className="text-navy-600 mt-1">Family and staff contact directory</p>
        </div>
        <button
          onClick={() => { setShowInviteModal(true); generateInviteLink() }}
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-2xl hover:from-lavender-600 hover:to-lavender-700 transition-all duration-200 shadow-float hover:-translate-y-0.5"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Contact
        </button>
      </div>

      {/* Family Members */}
      <div>
        <h3 className="text-lg font-semibold text-navy-800 mb-3 flex items-center gap-2">
          <Heart className="h-5 w-5 text-peach-500" />
          Family ({familyMembers.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {familyMembers.map(renderMemberCard)}
        </div>
      </div>

      {/* Staff Members */}
      {staffMembers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-navy-800 mb-3 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-mint-500" />
            Facility Staff ({staffMembers.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {staffMembers.map(renderMemberCard)}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-glass-lg animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy-900">Add Contact</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-cream-100 rounded-xl transition-colors">
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Name</label>
                <input type="text" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent" placeholder="Enter name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Relationship</label>
                <input type="text" value={newMember.relationship} onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                  className="w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent" placeholder="e.g., Son, Granddaughter, Friend" />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
                <input type="email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent" placeholder="Enter email" />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Phone (optional)</label>
                <input type="tel" value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent" placeholder="(555) 123-4567" />
              </div>

              {/* Invite Link */}
              <div className="bg-cream-50 rounded-2xl p-4">
                <label className="block text-sm font-medium text-navy-700 mb-2">Or share invite link</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={inviteLink} readOnly
                    className="flex-1 px-3 py-2.5 bg-white border border-lavender-200 rounded-xl text-sm text-navy-600" />
                  <button onClick={copyToClipboard}
                    className="p-2.5 bg-lavender-100 text-lavender-700 rounded-xl hover:bg-lavender-200 transition-colors">
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2.5 border border-lavender-200 text-navy-700 rounded-xl hover:bg-cream-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleInvite}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 transition-all duration-200 shadow-soft">
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
