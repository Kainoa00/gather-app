'use client'

import { useState } from 'react'
import {
  Activity,
  Plus,
  Search,
  AlertTriangle,
  AlertCircle,
  Info,
  User,
  Clock,
  Tag,
  X,
  Image as ImageIcon
} from 'lucide-react'
import { Incident, IncidentSeverity } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ImageUploadButton, ImageGallery } from './ImageUpload'

interface IncidentFeedProps {
  incidents: Incident[]
  onAddIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'reportedBy'>) => void
}

const severityConfig = {
  info: {
    label: 'Info',
    icon: Info,
    color: 'bg-sage-100 text-sage-700 border-sage-200',
    bgColor: 'bg-sage-50',
    iconColor: 'text-sage-600',
  },
  warning: {
    label: 'Warning',
    icon: AlertCircle,
    color: 'bg-terracotta-100 text-terracotta-700 border-terracotta-200',
    bgColor: 'bg-terracotta-50',
    iconColor: 'text-terracotta-600',
  },
  urgent: {
    label: 'Urgent',
    icon: AlertTriangle,
    color: 'bg-primary-100 text-primary-700 border-primary-200',
    bgColor: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
}

export default function IncidentFeed({ incidents, onAddIncident }: IncidentFeedProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSeverity, setFilterSeverity] = useState<IncidentSeverity | 'all'>('all')
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'info' as IncidentSeverity,
    reportedByName: 'Sarah',
    tags: [] as string[],
    photos: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')

  const filteredIncidents = incidents
    .filter((incident) => {
      const matchesSearch =
        searchQuery === '' ||
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity

      return matchesSearch && matchesSeverity
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleAddTag = () => {
    if (tagInput.trim() && !newIncident.tags.includes(tagInput.trim())) {
      setNewIncident({
        ...newIncident,
        tags: [...newIncident.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setNewIncident({
      ...newIncident,
      tags: newIncident.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleAddPhoto = (imageData: string) => {
    setNewIncident({
      ...newIncident,
      photos: [...newIncident.photos, imageData],
    })
  }

  const handleRemovePhoto = (index: number) => {
    setNewIncident({
      ...newIncident,
      photos: newIncident.photos.filter((_, i) => i !== index),
    })
  }

  const handleAddIncident = () => {
    if (newIncident.title && newIncident.description) {
      onAddIncident(newIncident)
      setNewIncident({
        title: '',
        description: '',
        severity: 'info',
        reportedByName: 'Sarah',
        tags: [],
        photos: [],
      })
      setShowAddModal(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-warm-900">Incident Feed</h2>
          <p className="text-warm-600 mt-1">
            Health updates and care notes
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-5 py-2.5 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-all duration-200 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Log Update
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incidents, tags..."
            className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'urgent', 'warning', 'info'] as const).map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filterSeverity === severity
                  ? severity === 'all'
                    ? 'bg-primary-100 text-primary-700 shadow-sm'
                    : severityConfig[severity].color
                  : 'bg-white text-warm-600 hover:bg-cream-100 border border-cream-200'
              }`}
            >
              {severity === 'all' ? 'All' : severityConfig[severity].label}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-cream-200">
            <Activity className="h-12 w-12 text-cream-400 mx-auto mb-3" />
            <p className="text-warm-500">No incidents found</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const config = severityConfig[incident.severity]
            const Icon = config.icon
            return (
              <div
                key={incident.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-cream-200 hover:shadow-warm transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${config.bgColor} flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${config.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          <h3 className="font-semibold text-warm-900">{incident.title}</h3>
                        </div>
                        <p className="text-warm-600 mt-2">{incident.description}</p>
                      </div>
                    </div>

                    {/* Photos */}
                    {incident.photos && incident.photos.length > 0 && (
                      <div className="mt-3">
                        <ImageGallery images={incident.photos} />
                      </div>
                    )}

                    {/* Tags */}
                    {incident.tags && incident.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {incident.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-cream-100 text-warm-600 rounded-full text-xs"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-4 text-sm text-warm-500">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {incident.reportedByName}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-warm-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-warm-900">Log Health Update</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-warm-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Severity
                </label>
                <div className="flex gap-2">
                  {(['info', 'warning', 'urgent'] as const).map((severity) => {
                    const config = severityConfig[severity]
                    const Icon = config.icon
                    return (
                      <button
                        key={severity}
                        onClick={() => setNewIncident({ ...newIncident, severity })}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                          newIncident.severity === severity
                            ? `${config.color} border-current`
                            : 'border-cream-200 text-warm-600 hover:bg-cream-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Brief summary of the update"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  placeholder="Provide details about what happened, actions taken, and any follow-up needed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Tags (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add a tag"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2.5 bg-cream-100 text-warm-700 rounded-xl hover:bg-cream-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {newIncident.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newIncident.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 bg-cream-100 text-warm-600 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 p-0.5 hover:bg-cream-200 rounded-full transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Photos (optional)
                </label>
                <div className="flex items-start gap-3">
                  <ImageUploadButton onImageSelect={handleAddPhoto} />
                  {newIncident.photos.length > 0 && (
                    <span className="text-sm text-warm-500 py-2">
                      {newIncident.photos.length} photo{newIncident.photos.length !== 1 ? 's' : ''} added
                    </span>
                  )}
                </div>
                {newIncident.photos.length > 0 && (
                  <ImageGallery
                    images={newIncident.photos}
                    onRemove={handleRemovePhoto}
                    className="mt-3"
                  />
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-cream-200 text-warm-700 rounded-xl hover:bg-cream-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIncident}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-warm"
              >
                Log Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
