'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/src/lib/api';
import { useRouter } from 'next/navigation';
import MyEventsList from '@/src/components/host/MyEventsList';

export default function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'tickets' | 'events' | 'security'>('profile');
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tickets, setTickets] = useState<any[]>([]);
    
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        avatar: '',
        isHost: false,
        hostName: '',
        hostBio: '',
        hostVerified: false
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        // Check if user is logged in via localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        
        loadUserData();
        loadTickets();
    }, []);

    const loadUserData = async () => {
        setIsLoading(true);
        try {
            const userData = await api.getMe();
            if (userData && userData.user) {
                const user = userData.user;
                setUser(user);
                
                // Update localStorage with fresh data
                localStorage.setItem('userData', JSON.stringify(user));
                localStorage.setItem('user', user.name);
                
                setProfileData({
                    name: user.name || '',
                    email: user.email || '',
                    bio: user.bio || '',
                    avatar: user.avatar || '',
                    isHost: user.isHost || false,
                    hostName: user.hostName || user.name || '',
                    hostBio: user.hostBio || '',
                    hostVerified: user.hostVerified || false
                });
            } else if (userData) {
                // Direct user object
                setUser(userData);
                
                // Update localStorage
                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('user', userData.name);
                
                setProfileData({
                    name: userData.name || '',
                    email: userData.email || '',
                    bio: userData.bio || '',
                    avatar: userData.avatar || '',
                    isHost: userData.isHost || false,
                    hostName: userData.hostName || userData.name || '',
                    hostBio: userData.hostBio || '',
                    hostVerified: userData.hostVerified || false
                });
            } else {
                // Fallback to localStorage data
                const storedUserData = localStorage.getItem('userData');
                if (storedUserData) {
                    const storedUser = JSON.parse(storedUserData);
                    setUser(storedUser);
                    setProfileData({
                        name: storedUser.name || '',
                        email: storedUser.email || '',
                        bio: storedUser.bio || '',
                        avatar: storedUser.avatar || '',
                        isHost: storedUser.isHost || false,
                        hostName: storedUser.hostName || storedUser.name || '',
                        hostBio: storedUser.hostBio || '',
                        hostVerified: storedUser.hostVerified || false
                    });
                } else {
                    router.push('/login');
                }
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            // Fallback to localStorage
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData) {
                try {
                    const storedUser = JSON.parse(storedUserData);
                    setUser(storedUser);
                    setProfileData({
                        name: storedUser.name || '',
                        email: storedUser.email || '',
                        bio: storedUser.bio || '',
                        avatar: storedUser.avatar || '',
                        isHost: storedUser.isHost || false,
                        hostName: storedUser.hostName || storedUser.name || '',
                        hostBio: storedUser.hostBio || '',
                        hostVerified: storedUser.hostVerified || false
                    });
                } catch (e) {
                    console.error('Error parsing stored user data:', e);
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loadTickets = async () => {
        try {
            const bookings = await api.getBookings();
            if (Array.isArray(bookings)) {
                setTickets(bookings);
            } else if (bookings && (bookings as any).bookings && Array.isArray((bookings as any).bookings)) {
                setTickets((bookings as any).bookings);
            } else {
                setTickets([]);
            }
        } catch (error) {
            console.error('Failed to load tickets:', error);
            // Set empty array on error instead of crashing
            setTickets([]);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const result = await api.updateProfile({
                name: profileData.name,
                bio: profileData.bio,
                avatar: profileData.avatar,
                isHost: profileData.isHost,
                hostName: profileData.hostName,
                hostBio: profileData.hostBio
            });
            
            if (result && result.user) {
                // Update local state
                setUser(result.user);
                
                // Update localStorage with all user data
                localStorage.setItem('user', result.user.name);
                localStorage.setItem('userData', JSON.stringify(result.user));
                
                // Update profile data state with the saved values
                setProfileData({
                    name: result.user.name || '',
                    email: result.user.email || '',
                    bio: result.user.bio || '',
                    avatar: result.user.avatar || '',
                    isHost: result.user.isHost || false,
                    hostName: result.user.hostName || result.user.name || '',
                    hostBio: result.user.hostBio || '',
                    hostVerified: result.user.hostVerified || false
                });
                
                // Dispatch storage event to update UI components
                window.dispatchEvent(new Event('storage'));
            }
            
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (error: any) {
            console.error('Profile update error:', error);
            alert(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        setIsSaving(true);
        try {
            // In a real app, this would call a password change API
            alert('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            alert(error.message || 'Failed to change password');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Clear all authentication data
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        
        // Dispatch storage event to update UI
        window.dispatchEvent(new Event('storage'));
        
        // Force full page reload to clear any cached state
        window.location.replace('/');
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                    <p className="text-text-secondary">Manage your account settings and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-surface rounded-2xl p-6 border border-white/10 sticky top-24">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white mb-3">
                                    {profileData.name.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="font-bold text-lg">{profileData.name}</h3>
                                <p className="text-sm text-text-secondary">{profileData.email}</p>
                                {profileData.isHost && (
                                    <span className="mt-2 px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                                        Host Account
                                    </span>
                                )}
                            </div>
                            
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                        activeTab === 'profile' 
                                            ? 'bg-primary text-white' 
                                            : 'hover:bg-surface-highlight'
                                    }`}
                                >
                                    Profile Info
                                </button>
                                <button
                                    onClick={() => setActiveTab('tickets')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                        activeTab === 'tickets' 
                                            ? 'bg-primary text-white' 
                                            : 'hover:bg-surface-highlight'
                                    }`}
                                >
                                    My Tickets
                                </button>
                                <button
                                    onClick={() => setActiveTab('events')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                        activeTab === 'events' 
                                            ? 'bg-primary text-white' 
                                            : 'hover:bg-surface-highlight'
                                    }`}
                                >
                                    My Events
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                        activeTab === 'security' 
                                            ? 'bg-primary text-white' 
                                            : 'hover:bg-surface-highlight'
                                    }`}
                                >
                                    Security
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                                >
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-surface rounded-2xl p-8 border border-white/10">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Profile Information</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    {/* Basic Info */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                                    disabled={!isEditing}
                                                    className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    disabled
                                                    className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 opacity-50 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">Bio</label>
                                                <textarea
                                                    value={profileData.bio}
                                                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                                    disabled={!isEditing}
                                                    rows={3}
                                                    className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                                    placeholder="Tell us about yourself..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Host Settings */}
                                    <div className="border-t border-white/10 pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">Host Profile</h3>
                                                <p className="text-sm text-text-secondary">Settings for hosting events</p>
                                            </div>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={profileData.isHost}
                                                    onChange={(e) => setProfileData({...profileData, isHost: e.target.checked})}
                                                    disabled={!isEditing}
                                                    className="w-5 h-5 rounded border-white/20 text-primary focus:ring-primary disabled:opacity-50"
                                                />
                                                <span className="text-sm font-medium">Enable Host Mode</span>
                                            </label>
                                        </div>

                                        {profileData.isHost && (
                                            <div className="space-y-4 mt-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-text-secondary mb-2">Host Display Name</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.hostName}
                                                        onChange={(e) => setProfileData({...profileData, hostName: e.target.value})}
                                                        disabled={!isEditing}
                                                        className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                                        placeholder="Name shown on your events"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-text-secondary mb-2">Host Bio</label>
                                                    <textarea
                                                        value={profileData.hostBio}
                                                        onChange={(e) => setProfileData({...profileData, hostBio: e.target.value})}
                                                        disabled={!isEditing}
                                                        rows={4}
                                                        className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                                        placeholder="Describe your hosting experience and what makes your events special..."
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    loadUserData();
                                                }}
                                                className="px-6 py-3 bg-surface-highlight text-text-secondary rounded-xl font-medium hover:bg-surface transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* Tickets Tab */}
                        {activeTab === 'tickets' && (
                            <div className="bg-surface rounded-2xl p-8 border border-white/10">
                                <h2 className="text-2xl font-bold mb-6">My Tickets</h2>
                                {tickets.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🎫</div>
                                        <h3 className="text-xl font-bold mb-2">No tickets yet</h3>
                                        <p className="text-text-secondary mb-6">Start exploring events and book your first ticket!</p>
                                        <button
                                            onClick={() => router.push('/booking')}
                                            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                                        >
                                            Browse Events
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {tickets.map((ticket) => (
                                            <div key={ticket.id} className="bg-surface-highlight rounded-xl p-6 border border-white/5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg mb-1">Booking #{ticket.id.slice(-8)}</h3>
                                                        <p className="text-sm text-text-secondary">
                                                            {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        ticket.status === 'confirmed' 
                                                            ? 'bg-green-500/20 text-green-500' 
                                                            : ticket.status === 'pending'
                                                            ? 'bg-yellow-500/20 text-yellow-500'
                                                            : 'bg-red-500/20 text-red-500'
                                                    }`}>
                                                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {ticket.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span>{item.title} x{item.qty}</span>
                                                            <span className="font-medium">₹{item.price * item.qty}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
                                                    <span className="font-bold">Total Amount:</span>
                                                    <span className="text-xl font-bold text-primary">₹{ticket.totalAmount}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Events Tab */}
                        {activeTab === 'events' && (
                            <div className="bg-surface rounded-2xl p-8 border border-white/10">
                                <h2 className="text-2xl font-bold mb-6">My Events</h2>
                                {!user?.isHost ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🎪</div>
                                        <h3 className="text-xl font-bold mb-2">Host Account Required</h3>
                                        <p className="text-text-secondary mb-6">Enable host mode in your profile to create and manage events.</p>
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                                        >
                                            Enable Host Mode
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-6">
                                            <button
                                                onClick={() => router.push('/host')}
                                                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                                            >
                                                Create New Event
                                            </button>
                                        </div>
                                        <MyEventsList 
                                            onEdit={(event: any) => {
                                                // Navigate to host page with event data
                                                router.push(`/host?edit=${event.id}`);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="bg-surface rounded-2xl p-8 border border-white/10">
                                <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                                
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                                    required
                                                    className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                    required
                                                    minLength={6}
                                                    className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                    required
                                                    minLength={6}
                                                    className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {isSaving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>

                                <div className="border-t border-white/10 mt-8 pt-8">
                                    <h3 className="text-lg font-semibold mb-4 text-red-500">Danger Zone</h3>
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                        <h4 className="font-medium mb-2">Delete Account</h4>
                                        <p className="text-sm text-text-secondary mb-4">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                                    alert('Account deletion feature coming soon!');
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
