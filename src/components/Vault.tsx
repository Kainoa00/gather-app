'use client'

import { useState } from 'react'
import {
  Shield,
  CreditCard,
  Pill,
  Phone,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plus,
  Wifi,
  Lock,
  AlertCircle,
  X
} from 'lucide-react'
import { Vault as VaultType, InsuranceCard, Medication, ProviderContact, AccessCode } from '@/types'

interface VaultProps {
  vault: VaultType
  onUpdateVault: (vault: VaultType) => void
}

const tabs = [
  { id: 'insurance', label: 'Insurance', icon: CreditCard },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'providers', label: 'Providers', icon: Phone },
  { id: 'access', label: 'Access Codes', icon: Key },
]

export default function VaultComponent({ vault, onUpdateVault }: VaultProps) {
  const [activeTab, setActiveTab] = useState('insurance')
  const [showAddModal, setShowAddModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set())

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleCodeVisibility = (id: string) => {
    const newVisible = new Set(visibleCodes)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisibleCodes(newVisible)
  }

  const getAccessIcon = (type: string) => {
    switch (type) {
      case 'wifi':
        return Wifi
      case 'door':
        return Lock
      case 'alarm':
        return AlertCircle
      default:
        return Key
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">The Vault</h2>
          <p className="text-gray-600 mt-1">
            Critical information at your fingertips
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700 font-medium">Encrypted</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Insurance Cards */}
        {activeTab === 'insurance' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Insurance Cards</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                + Add Card
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {vault.insuranceCards.map((card) => (
                <div
                  key={card.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-primary-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{card.name}</h4>
                      {card.notes && (
                        <span className="text-xs text-gray-500">{card.notes}</span>
                      )}
                    </div>
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Member ID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{card.memberId}</span>
                        <button
                          onClick={() => copyToClipboard(card.memberId, `ins-${card.id}`)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedId === `ins-${card.id}` ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    {card.groupNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Group #</span>
                        <span className="font-mono text-sm">{card.groupNumber}</span>
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
              <h3 className="font-semibold text-gray-900">Current Medications</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                + Add Medication
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Medication</th>
                    <th className="pb-3 font-medium">Dosage</th>
                    <th className="pb-3 font-medium">Frequency</th>
                    <th className="pb-3 font-medium">Prescribed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vault.medications.map((med) => (
                    <tr key={med.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <span className="font-medium text-gray-900">{med.name}</span>
                          {med.notes && (
                            <p className="text-xs text-gray-500 mt-0.5">{med.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{med.dosage}</td>
                      <td className="py-3 text-gray-600">{med.frequency}</td>
                      <td className="py-3 text-gray-600">{med.prescribedBy || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Providers */}
        {activeTab === 'providers' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Healthcare Providers</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                + Add Provider
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vault.providers.map((provider) => (
                <div
                  key={provider.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-primary-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{provider.name}</h4>
                      <span className="text-sm text-primary-600">{provider.specialty}</span>
                    </div>
                  </div>
                  {provider.address && (
                    <p className="text-sm text-gray-500 mt-2">{provider.address}</p>
                  )}
                  <a
                    href={`tel:${provider.phone}`}
                    className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    {provider.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Access Codes */}
        {activeTab === 'access' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Access Codes</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                + Add Code
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {vault.accessCodes.map((code) => {
                const Icon = getAccessIcon(code.type)
                const isVisible = visibleCodes.has(code.id)
                return (
                  <div
                    key={code.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-primary-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900">{code.label}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                        {code.type}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-mono text-lg">
                        {isVisible ? code.code : '••••••'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleCodeVisibility(code.id)}
                          className="p-2 hover:bg-gray-200 rounded-lg"
                        >
                          {isVisible ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(code.code, `code-${code.id}`)}
                          className="p-2 hover:bg-gray-200 rounded-lg"
                        >
                          {copiedId === `code-${code.id}` ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-900">Your data is protected</h4>
          <p className="text-sm text-blue-700 mt-1">
            All information in the Vault is encrypted at rest and in transit.
            Only Care Circle members with appropriate permissions can access this data.
          </p>
        </div>
      </div>
    </div>
  )
}
