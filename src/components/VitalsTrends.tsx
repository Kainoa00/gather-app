'use client'

import { useState, useMemo } from 'react'
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  Weight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { LogEntry } from '@/types'
import { format, subDays, isAfter } from 'date-fns'

interface VitalsTrendsProps {
  logEntries: LogEntry[]
}

type TimeRange = '7d' | '30d' | '90d'

export default function VitalsTrends({ logEntries }: VitalsTrendsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')

  const vitalsEntries = useMemo(() => {
    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoffDate = subDays(now, daysBack)

    return logEntries
      .filter(
        (entry) =>
          entry.category === 'vitals' &&
          entry.vitals &&
          isAfter(new Date(entry.createdAt), cutoffDate)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [logEntries, timeRange])

  const bpData = useMemo(() => {
    const entries = vitalsEntries.filter(
      (e) => e.vitals?.bloodPressureSystolic && e.vitals?.bloodPressureDiastolic
    )
    if (entries.length === 0) return null

    const systolicValues = entries.map((e) => e.vitals!.bloodPressureSystolic!)
    const diastolicValues = entries.map((e) => e.vitals!.bloodPressureDiastolic!)

    const avgSystolic = Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length)
    const avgDiastolic = Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length)
    const highCount = entries.filter(
      (e) => e.vitals!.bloodPressureSystolic! > 140 || e.vitals!.bloodPressureDiastolic! > 90
    ).length

    return {
      entries,
      avgSystolic,
      avgDiastolic,
      minSystolic: Math.min(...systolicValues),
      maxSystolic: Math.max(...systolicValues),
      minDiastolic: Math.min(...diastolicValues),
      maxDiastolic: Math.max(...diastolicValues),
      highCount,
      maxValue: Math.max(...systolicValues, 160),
    }
  }, [vitalsEntries])

  const hrData = useMemo(() => {
    const entries = vitalsEntries.filter((e) => e.vitals?.heartRate)
    if (entries.length === 0) return null

    const values = entries.map((e) => e.vitals!.heartRate!)
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    const abnormalCount = entries.filter(
      (e) => e.vitals!.heartRate! < 60 || e.vitals!.heartRate! > 100
    ).length

    return {
      entries,
      avg,
      min: Math.min(...values),
      max: Math.max(...values),
      abnormalCount,
    }
  }, [vitalsEntries])

  const quickStats = useMemo(() => {
    const latestEntry = vitalsEntries[vitalsEntries.length - 1]
    const firstEntry = vitalsEntries[0]

    return {
      weight: {
        current: latestEntry?.vitals?.weight,
        trend:
          latestEntry?.vitals?.weight && firstEntry?.vitals?.weight
            ? latestEntry.vitals.weight > firstEntry.vitals.weight
              ? 'up'
              : latestEntry.vitals.weight < firstEntry.vitals.weight
              ? 'down'
              : 'stable'
            : 'stable',
      },
      o2: {
        current: latestEntry?.vitals?.oxygenSaturation,
        normal: (latestEntry?.vitals?.oxygenSaturation ?? 0) >= 95,
      },
      temp: {
        current: latestEntry?.vitals?.temperature,
        normal:
          (latestEntry?.vitals?.temperature ?? 98) >= 97 &&
          (latestEntry?.vitals?.temperature ?? 98) <= 99,
      },
      respRate: {
        current: latestEntry?.vitals?.respiratoryRate,
        normal:
          (latestEntry?.vitals?.respiratoryRate ?? 16) >= 12 &&
          (latestEntry?.vitals?.respiratoryRate ?? 16) <= 20,
      },
    }
  }, [vitalsEntries])

  const formatDateLabel = (date: Date) => {
    if (timeRange === '7d') {
      return format(date, 'EEE')
    }
    return format(date, 'MMM d')
  }

  if (vitalsEntries.length === 0) {
    return (
      <div className="card-glass p-8 text-center">
        <Heart className="h-12 w-12 text-navy-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-navy-900 mb-2">No Vitals Data</h3>
        <p className="text-navy-500">No vitals have been recorded in the selected time period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-lavender-100 text-lavender-700 shadow-soft'
                : 'text-navy-600 hover:bg-cream-100'
            }`}
          >
            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
          </button>
        ))}
      </div>

      {/* Blood Pressure Chart */}
      {bpData && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-navy-900">Blood Pressure</h3>
          </div>

          <div className="flex items-end gap-2 h-48 mb-4">
            {bpData.entries.map((entry, idx) => {
              const systolic = entry.vitals!.bloodPressureSystolic!
              const diastolic = entry.vitals!.bloodPressureDiastolic!
              const systolicHeight = (systolic / bpData.maxValue) * 100
              const diastolicHeight = (diastolic / bpData.maxValue) * 100

              return (
                <div key={entry.id} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-xs text-navy-600 font-medium">{systolic}</span>
                  <div className="w-full flex flex-col gap-0.5">
                    <div
                      className="w-full bg-gradient-to-t from-red-400 to-red-300 rounded-t-lg transition-all duration-500"
                      style={{ height: `${systolicHeight}px` }}
                    />
                    <div
                      className="w-full bg-gradient-to-t from-blue-400 to-blue-300 rounded-b-lg transition-all duration-500"
                      style={{ height: `${diastolicHeight}px` }}
                    />
                  </div>
                  <span className="text-xs text-navy-400 truncate w-full text-center">
                    {formatDateLabel(new Date(entry.createdAt))}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-navy-600">
              <strong>Avg:</strong> {bpData.avgSystolic}/{bpData.avgDiastolic}
            </span>
            <span className="text-navy-500">
              Range: {bpData.minSystolic}-{bpData.maxSystolic} / {bpData.minDiastolic}-{bpData.maxDiastolic}
            </span>
            {bpData.highCount > 0 ? (
              <span className="flex items-center gap-1 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                {bpData.highCount} high reading{bpData.highCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-mint-600">
                <CheckCircle2 className="h-4 w-4" />
                All normal
              </span>
            )}
          </div>
        </div>
      )}

      {/* Heart Rate Chart */}
      {hrData && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-mint-500" />
            <h3 className="font-semibold text-navy-900">Heart Rate</h3>
          </div>

          <div className="relative h-32 mb-4">
            {/* Average line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-mint-300"
              style={{
                bottom: `${((hrData.avg - hrData.min + 10) / (hrData.max - hrData.min + 20)) * 100}%`,
              }}
            >
              <span className="absolute -top-5 right-0 text-xs text-mint-600 bg-white px-1">
                avg {hrData.avg}
              </span>
            </div>

            {/* Data points */}
            {hrData.entries.map((entry, idx) => {
              const hr = entry.vitals!.heartRate!
              const left = (idx / (hrData.entries.length - 1 || 1)) * 100
              const bottom = ((hr - hrData.min + 10) / (hrData.max - hrData.min + 20)) * 100

              return (
                <div
                  key={entry.id}
                  className="absolute w-3 h-3 rounded-full bg-mint-500 shadow-soft transform -translate-x-1/2 transition-all duration-300 hover:scale-150"
                  style={{ left: `${left}%`, bottom: `${bottom}%` }}
                  title={`${hr} bpm - ${format(new Date(entry.createdAt), 'MMM d, h:mm a')}`}
                />
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-navy-600">
              <strong>Avg:</strong> {hrData.avg} bpm
            </span>
            <span className="text-navy-500">
              Range: {hrData.min}-{hrData.max}
            </span>
            {hrData.abnormalCount > 0 ? (
              <span className="flex items-center gap-1 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                {hrData.abnormalCount} abnormal
              </span>
            ) : (
              <span className="flex items-center gap-1 text-mint-600">
                <CheckCircle2 className="h-4 w-4" />
                All normal
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Weight */}
        <div className="card-glass p-4">
          <div className="flex items-center gap-2 mb-2">
            <Weight className="h-4 w-4 text-navy-400" />
            <span className="text-sm text-navy-500">Weight</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">
              {quickStats.weight.current ?? '--'}
            </span>
            <span className="text-sm text-navy-500">lbs</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            {quickStats.weight.trend === 'up' && (
              <>
                <TrendingUp className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">Up</span>
              </>
            )}
            {quickStats.weight.trend === 'down' && (
              <>
                <TrendingDown className="h-3 w-3 text-mint-500" />
                <span className="text-xs text-mint-600">Down</span>
              </>
            )}
            {quickStats.weight.trend === 'stable' && (
              <>
                <Minus className="h-3 w-3 text-navy-400" />
                <span className="text-xs text-navy-500">Stable</span>
              </>
            )}
          </div>
        </div>

        {/* O2 Sat */}
        <div className={`card-glass p-4 ${quickStats.o2.normal ? '' : 'ring-2 ring-orange-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Wind className="h-4 w-4 text-navy-400" />
            <span className="text-sm text-navy-500">O2 Sat</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">
              {quickStats.o2.current ?? '--'}
            </span>
            <span className="text-sm text-navy-500">%</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            {quickStats.o2.normal ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-mint-500" />
                <span className="text-xs text-mint-600">Normal</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">Low</span>
              </>
            )}
          </div>
        </div>

        {/* Temperature */}
        <div className={`card-glass p-4 ${quickStats.temp.normal ? '' : 'ring-2 ring-orange-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-navy-400" />
            <span className="text-sm text-navy-500">Temp</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">
              {quickStats.temp.current?.toFixed(1) ?? '--'}
            </span>
            <span className="text-sm text-navy-500">°F</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            {quickStats.temp.normal ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-mint-500" />
                <span className="text-xs text-mint-600">Normal</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">Elevated</span>
              </>
            )}
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className={`card-glass p-4 ${quickStats.respRate.normal ? '' : 'ring-2 ring-orange-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-navy-400" />
            <span className="text-sm text-navy-500">Resp Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy-900">
              {quickStats.respRate.current ?? '--'}
            </span>
            <span className="text-sm text-navy-500">/min</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            {quickStats.respRate.normal ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-mint-500" />
                <span className="text-xs text-mint-600">Normal</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">Abnormal</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
