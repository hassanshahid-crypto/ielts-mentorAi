'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Card, CardBody, CardHeader, Button, Input } from '@/components/ui'
import { User, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  })
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '' })
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateProfile(profileForm)
      await refreshUser()
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPw(true)
    try {
      await api.changePassword(passwordForm)
      setPasswordForm({ old_password: '', new_password: '' })
      toast.success('Password changed!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setChangingPw(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Personal Information</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} />
                <Input label="Last Name" value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} />
              </div>
              <Input label="Email" value={user?.email || ''} disabled helperText="Email cannot be changed" />
              <Input label="Phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <Button type="submit" loading={saving}>Save Changes</Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Change Password</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={changePassword} className="space-y-4">
              <Input label="Current Password" type="password" value={passwordForm.old_password} onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })} required />
              <Input label="New Password" type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required />
              <Button type="submit" loading={changingPw} variant="outline">Change Password</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}
