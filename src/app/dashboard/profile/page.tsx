// src/app/dashboard/profile/page.tsx
'use client'

import { format } from 'date-fns'
import { ChangeEvent, useEffect, useState } from 'react'

type ProfileData = {
  fullName: string
  nickname: string
  gender: string
  country: string
  language: string
  timezone: string
  email: string
  avatarUrl: string   // data-URL for the image
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    nickname: '',
    gender: '',
    country: '',
    language: '',
    timezone: '',
    email: '',
    avatarUrl: '',      // will load from localStorage
  })
  const [isEditing, setIsEditing] = useState(false)

  // On mount: fetch user email + name, then load avatar from localStorage
  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        const userEmail = data.user as string
        setProfile(p => ({
          ...p,
          email: userEmail,
          fullName: userEmail.split('@')[0],
          avatarUrl: localStorage.getItem('avatar') || '',
        }))
      })
  }, [])

  // standard field handler
  const handleField = (field: keyof ProfileData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setProfile(p => ({ ...p, [field]: e.target.value }))

  // file input handler: read as Data URL, preview & save to localStorage
  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setProfile(p => ({ ...p, avatarUrl: dataUrl }))
      localStorage.setItem('avatar', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const toggleEdit = () => {
    // if saving, you could PUT /api/profile here...
    setIsEditing(!isEditing)
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-yellow-50 p-6 min-h-full">
      <div className="bg-white rounded-2xl shadow p-8 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome, {profile.fullName}
            </h1>
            <p className="text-sm text-gray-500">
              {format(new Date(), 'EEEE, dd MMMM yyyy')}
            </p>
          </div>
          <button
            onClick={toggleEdit}
            className={`px-4 py-2 rounded-lg font-medium ${
              isEditing
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition`}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        {/* BODY */}
        <div className="flex space-x-8">
          {/* AVATAR UPLOAD */}
          <div className="flex-shrink-0 space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              disabled={!isEditing}
              className="block w-48 text-sm text-gray-700"
            />
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-full object-cover mt-2"
              />
            )}
          </div>

          {/* PROFILE FORM */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {[
              ['Full Name', 'fullName'],
              ['Nick Name', 'nickname'],
              ['Gender', 'gender'],
              ['Country', 'country'],
              ['Language', 'language'],
              ['Time Zone', 'timezone'],
            ].map(([label, field]) => (
              <div key={field as string}>
                <label className="block text-sm font-medium text-gray-600">
                  {label}
                </label>
                {field === 'gender' ? (
                  <select
                    disabled={!isEditing}
                    value={(profile as any)[field]}
                    onChange={handleField(field as keyof ProfileData)}
                    className="mt-1 w-full rounded-lg border-gray-200 bg-gray-50 disabled:bg-gray-100"
                  >
                    <option value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={(profile as any)[field]}
                    onChange={handleField(field as keyof ProfileData)}
                    className="mt-1 w-full rounded-lg border-gray-200 bg-gray-50 disabled:bg-gray-100"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* EMAIL */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            My email address
          </h2>
          <p className="text-gray-900">{profile.email}</p>
        </div>
      </div>
    </div>
  )
}
