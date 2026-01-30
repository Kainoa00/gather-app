'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react'

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void
  currentImage?: string
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ImageUpload({
  onImageSelect,
  currentImage,
  label = 'Upload Image',
  className = '',
  size = 'md'
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'h-24 w-24',
    md: 'h-40 w-40',
    lg: 'h-56 w-56',
  }

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setPreview(base64)
        onImageSelect(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeImage = () => {
    setPreview(null)
    onImageSelect('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-warm-700 mb-2">
          {label}
        </label>
      )}

      <div
        className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden transition-all duration-200 ${
          isDragging
            ? 'ring-2 ring-primary-500 ring-offset-2'
            : 'ring-1 ring-cream-200 hover:ring-primary-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative h-full w-full group">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-warm-900 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
              <button
                onClick={removeImage}
                className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-xl shadow-lg transition-all duration-200 hover:bg-primary-50"
              >
                <X className="h-5 w-5 text-primary-600" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`h-full w-full flex flex-col items-center justify-center bg-cream-50 hover:bg-cream-100 transition-colors ${
              isDragging ? 'bg-primary-50' : ''
            }`}
          >
            <div className="p-3 bg-primary-100 rounded-2xl mb-2">
              <Camera className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-sm text-warm-600 font-medium">Upload</span>
            <span className="text-xs text-warm-400 mt-1">or drag & drop</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}

// Compact inline upload button for use in lists/cards
export function ImageUploadButton({
  onImageSelect,
  className = '',
}: {
  onImageSelect: (imageData: string) => void
  className?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onImageSelect(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`inline-flex items-center gap-2 px-3 py-2 bg-cream-100 text-warm-700 rounded-xl hover:bg-cream-200 transition-colors text-sm font-medium ${className}`}
      >
        <Upload className="h-4 w-4" />
        Add Photo
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}

// Image gallery for multiple photos
export function ImageGallery({
  images,
  onRemove,
  className = '',
}: {
  images: string[]
  onRemove?: (index: number) => void
  className?: string
}) {
  if (images.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative h-20 w-20 rounded-xl overflow-hidden group"
        >
          <img
            src={image}
            alt={`Image ${index + 1}`}
            className="h-full w-full object-cover"
          />
          {onRemove && (
            <button
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 p-1 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-warm-600" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
