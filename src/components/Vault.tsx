'use client'

import { useState } from 'react'
import {
  Shield,
  CreditCard,
  Pill,
  Phone,
  Copy,
  Check,
  Eye,
  EyeOff,
  Building2,
  Clock,
  MapPin,
  Wifi,
  Car,
  FileText,
  Upload,
  Download,
  Trash2,
} from 'lucide-react'
import { Vault as VaultType, VaultDocument } from '@/types'

interface VaultProps {
  vault: VaultType
  onUpdateVault: (vault: VaultType) => void
}

const tabs = [
  { id: 'facility', label: 'Facility Info', icon: Building2 },
  { id: 'insurance', label: 'Insurance', icon: CreditCard },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'providers', label: 'Care Team', icon: Phone },
  { id: 'documents', label: 'Documents', icon: FileText },
]

const categoryColors: Record<VaultDocument['category'], string> = {
  legal: 'bg-lavender-100 text-lavender-700',
  medical: 'bg-mint-100 text-mint-700',
  insurance: 'bg-peach-100 text-peach-700',
  other: 'bg-cream-200 text-navy-700',
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function VaultComponent({ vault, onUpdateVault }: VaultProps) {
  const [activeTab, setActiveTab] = useState('facility')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showWifiPassword, setShowWifiPassword] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [newDocCategory, setNewDocCategory] = useState<VaultDocument['category']>('other')
  const [newDocNotes, setNewDocNotes] = useState('')

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">The Vault</h2>
          <p className="text-navy-600 mt-1">Facility info, insurance, medications, and care team</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-mint-50 rounded-xl">
          <Shield className="h-5 w-5 text-mint-600" />
          <span className="text-sm text-mint-700 font-medium">Encrypted</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-lavender-100 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-lavender-100 text-lavender-700 shadow-sm'
                  : 'text-navy-600 hover:bg-cream-100'
              }`}>
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="card-glass">
        {/* Facility Info */}
        {activeTab === 'facility' && (
          <div className="p-6 space-y-6">
            <h3 className="font-semibold text-navy-900 text-lg">{vault.facilityInfo.facilityName}</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-lavender-50/50 rounded-xl p-4">
                <div className="text-xs text-navy-500 mb-1 flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Room
                </div>
                <div className="font-semibold text-navy-900 text-lg">
                  Room {vault.facilityInfo.roomNumber}
                </div>
                <div className="text-sm text-navy-600 mt-1">
                  {vault.facilityInfo.floor} · {vault.facilityInfo.wing}
                </div>
              </div>

              <div className="bg-mint-50/50 rounded-xl p-4">
                <div className="text-xs text-navy-500 mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Visiting Hours
                </div>
                <div className="font-semibold text-navy-900">{vault.facilityInfo.visitingHours}</div>
              </div>

              <div className="bg-peach-50/50 rounded-xl p-4">
                <div className="text-xs text-navy-500 mb-1 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Nurse Station
                </div>
                <div className="text-sm font-medium text-navy-900">{vault.facilityInfo.nurseStation}</div>
              </div>

              <div className="bg-cream-100/50 rounded-xl p-4">
                <div className="text-xs text-navy-500 mb-1 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Main Number
                </div>
                <a href={`tel:${vault.facilityInfo.facilityPhone}`} className="text-sm font-medium text-lavender-600 hover:text-lavender-700">
                  {vault.facilityInfo.facilityPhone}
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-navy-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-navy-500">Address</div>
                  <div className="text-sm text-navy-900">{vault.facilityInfo.facilityAddress}</div>
                </div>
              </div>

              {vault.facilityInfo.wifiNetwork && (
                <div className="flex items-start gap-3">
                  <Wifi className="h-5 w-5 text-navy-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-navy-500">Guest WiFi</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-medium text-navy-900">{vault.facilityInfo.wifiNetwork}</span>
                      <span className="text-sm text-navy-600">
                        Password: {showWifiPassword ? vault.facilityInfo.wifiPassword : '••••••••'}
                      </span>
                      <button onClick={() => setShowWifiPassword(!showWifiPassword)}
                        className="p-1 hover:bg-cream-100 rounded-lg transition-colors">
                        {showWifiPassword ? <EyeOff className="h-3.5 w-3.5 text-navy-400" /> : <Eye className="h-3.5 w-3.5 text-navy-400" />}
                      </button>
                      <button onClick={() => copyToClipboard(vault.facilityInfo.wifiPassword || '', 'wifi')}
                        className="p-1 hover:bg-cream-100 rounded-lg transition-colors">
                        {copiedId === 'wifi' ? <Check className="h-3.5 w-3.5 text-mint-600" /> : <Copy className="h-3.5 w-3.5 text-navy-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {vault.facilityInfo.parkingInfo && (
                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-navy-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-navy-500">Parking</div>
                    <div className="text-sm text-navy-900">{vault.facilityInfo.parkingInfo}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insurance Cards */}
        {activeTab === 'insurance' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Insurance Cards</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {vault.insuranceCards.map((card) => (
                <div key={card.id} className="border border-lavender-100 rounded-2xl p-4 hover:border-lavender-300 hover:shadow-soft transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-navy-900">{card.name}</h4>
                      {card.notes && <span className="text-xs text-navy-500">{card.notes}</span>}
                    </div>
                    <CreditCard className="h-5 w-5 text-lavender-300" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-navy-500">Member ID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-navy-700">{card.memberId}</span>
                        <button onClick={() => copyToClipboard(card.memberId, `ins-${card.id}`)}
                          className="p-1 hover:bg-cream-100 rounded-lg transition-colors">
                          {copiedId === `ins-${card.id}` ? <Check className="h-4 w-4 text-mint-600" /> : <Copy className="h-4 w-4 text-navy-400" />}
                        </button>
                      </div>
                    </div>
                    {card.groupNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-navy-500">Group #</span>
                        <span className="font-mono text-sm text-navy-700">{card.groupNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medications */}
        {activeTab === 'medications' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Current Medications</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-navy-500 border-b border-lavender-100">
                    <th className="pb-3 font-medium">Medication</th>
                    <th className="pb-3 font-medium">Dosage</th>
                    <th className="pb-3 font-medium">Frequency</th>
                    <th className="pb-3 font-medium">Prescribed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lavender-50">
                  {vault.medications.map((med) => (
                    <tr key={med.id} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3">
                        <div>
                          <span className="font-medium text-navy-900">{med.name}</span>
                          {med.notes && <p className="text-xs text-navy-500 mt-0.5">{med.notes}</p>}
                        </div>
                      </td>
                      <td className="py-3 text-navy-600">{med.dosage}</td>
                      <td className="py-3 text-navy-600">{med.frequency}</td>
                      <td className="py-3 text-navy-600">{med.prescribedBy || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Care Team / Providers */}
        {activeTab === 'providers' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Care Team</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vault.providers.map((provider) => (
                <div key={provider.id} className="border border-lavender-100 rounded-2xl p-4 hover:border-lavender-300 hover:shadow-soft transition-all duration-200">
                  <div>
                    <h4 className="font-medium text-navy-900">{provider.name}</h4>
                    <span className="text-sm text-lavender-600">{provider.specialty}</span>
                  </div>
                  {provider.address && <p className="text-sm text-navy-500 mt-2">{provider.address}</p>}
                  <a href={`tel:${provider.phone}`}
                    className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-lavender-50 text-lavender-700 rounded-xl hover:bg-lavender-100 transition-colors font-medium">
                    <Phone className="h-4 w-4" />
                    {provider.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {activeTab === 'documents' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Important Documents</h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 transition-all duration-200 shadow-sm font-medium text-sm"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>

            {/* Document cards grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {vault.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-lavender-100 rounded-2xl p-4 hover:border-lavender-300 hover:shadow-soft transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-lavender-50 rounded-xl flex-shrink-0">
                      <FileText className="h-5 w-5 text-lavender-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-navy-900 truncate">{doc.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            categoryColors[doc.category]
                          }`}
                        >
                          {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                        </span>
                        {doc.fileSize != null && (
                          <span className="text-xs text-navy-400">
                            {formatFileSize(doc.fileSize)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-navy-500 mt-2">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} by {doc.uploadedByName}
                      </p>
                      {doc.notes && (
                        <p className="text-xs text-navy-500 mt-1 italic">{doc.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-lavender-50">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-lavender-700 hover:bg-lavender-50 rounded-lg transition-colors font-medium">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-lavender-700 hover:bg-lavender-50 rounded-lg transition-colors font-medium">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty upload placeholder card */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 w-full border-2 border-dashed border-lavender-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:border-lavender-400 hover:bg-lavender-50/30 transition-all duration-200 cursor-pointer"
            >
              <Upload className="h-8 w-8 text-lavender-300" />
              <span className="text-sm font-medium text-navy-700">Upload Document</span>
              <span className="text-xs text-navy-400">Drag &amp; drop or click to browse</span>
              <span className="text-xs text-navy-400">PDF, JPG, PNG &middot; Max 10MB</span>
            </button>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-mint-50 rounded-2xl p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-mint-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-mint-900">Your data is protected</h4>
          <p className="text-sm text-mint-700 mt-1">
            All information in the Vault is encrypted at rest and in transit.
            Only Care Circle members with appropriate permissions can access this data.
          </p>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Upload Document</h3>

              {/* Drop zone */}
              <div className="border-2 border-dashed border-lavender-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:border-lavender-400 hover:bg-lavender-50/30 transition-all duration-200 cursor-pointer mb-5">
                <Upload className="h-8 w-8 text-lavender-300" />
                <span className="text-sm font-medium text-navy-700">Drag &amp; drop your file here</span>
                <span className="text-xs text-navy-400">or click to browse</span>
                <span className="text-xs text-navy-400">PDF, JPG, PNG &middot; Max 10MB</span>
              </div>

              {/* Document Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-navy-700 mb-1">Document Name</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g., Power of Attorney"
                  className="w-full px-4 py-2.5 border border-lavender-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent text-sm text-navy-900 placeholder:text-navy-400"
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-navy-700 mb-1">Category</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as VaultDocument['category'])}
                  className="w-full px-4 py-2.5 border border-lavender-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent text-sm text-navy-900 bg-white"
                >
                  <option value="legal">Legal</option>
                  <option value="medical">Medical</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-navy-700 mb-1">Notes (optional)</label>
                <textarea
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  placeholder="Add any relevant notes about this document..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-lavender-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent text-sm text-navy-900 placeholder:text-navy-400 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setNewDocName('')
                    setNewDocCategory('other')
                    setNewDocNotes('')
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-navy-600 hover:bg-cream-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 transition-all duration-200 shadow-sm font-medium text-sm"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
