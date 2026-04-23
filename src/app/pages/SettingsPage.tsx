import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Settings, User, Bell, Lock, Palette, Globe, Mail, Shield, Eye, Smartphone, LogOut, Trash2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/authStore';
import { API } from '../lib/config';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function SettingsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  async function onLogout() {
    try {
      const rt = refreshToken;
      if (rt) {
        await fetch(API('/auth/logout'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });
      }
    } catch {
      /* ignore */
    }
    logout();
    navigate('/auth');
  }

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [tradeAlerts, setTradeAlerts] = useState(true);
  const [missionAlerts, setMissionAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl mb-2 flex items-center gap-3">
                <Settings className="w-10 h-10 text-[#00ff88]" />
                Settings
              </h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>

            <Tabs defaultValue="account">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/5 mb-8">
                <TabsTrigger 
                  value="account"
                  className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences"
                  className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
                >
                  Preferences
                </TabsTrigger>
                <TabsTrigger 
                  value="security"
                  className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
                >
                  Security
                </TabsTrigger>
              </TabsList>

              {/* Account Settings */}
              <TabsContent value="account">
                <div className="space-y-6">
                  <GlassCard className="p-6">
                    <h2 className="text-lg mb-4 flex items-center gap-2">
                      <LogOut className="w-5 h-5 text-[#ff0055]" />
                      Session
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">Sign out clears local tokens.</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#ff0055]/50 text-[#ff0055] hover:bg-[#ff0055]/10"
                      onClick={() => void onLogout()}
                    >
                      Log out
                    </Button>
                  </GlassCard>
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <User className="w-5 h-5 text-[#00ff88]" />
                      <h2 className="text-xl">Profile Information</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            defaultValue="TradingEagle"
                            className="mt-2 bg-white/5 border-white/10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            defaultValue="trader@example.com"
                            className="mt-2 bg-white/5 border-white/10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          rows={3}
                          placeholder="Tell us about yourself..."
                          className="mt-2 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[#00ff88] focus:outline-none resize-none"
                        />
                      </div>

                      <Separator className="bg-white/10" />

                      <div>
                        <Label htmlFor="avatar">Avatar</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#00ff88] to-[#00ccff] rounded-full flex items-center justify-center text-3xl">
                            🦅
                          </div>
                          <Button variant="outline" className="bg-white/5 border-white/10">
                            Change Avatar
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="outline" className="bg-white/5 border-white/10">
                        Cancel
                      </Button>
                      <Button className="bg-[#00ff88] text-black hover:bg-[#00ff88]/90">
                        Save Changes
                      </Button>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Mail className="w-5 h-5 text-[#00ff88]" />
                      <h2 className="text-xl">Email Preferences</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Newsletter</p>
                          <p className="text-sm text-gray-400">Receive weekly trading insights</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Product Updates</p>
                          <p className="text-sm text-gray-400">Get notified about new features</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications">
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-5 h-5 text-[#00ff88]" />
                    <h2 className="text-xl">Notification Settings</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg mb-4">Channels</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-white">Email Notifications</p>
                              <p className="text-sm text-gray-400">Receive alerts via email</p>
                            </div>
                          </div>
                          <Switch 
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-white">Push Notifications</p>
                              <p className="text-sm text-gray-400">Get alerts on your device</p>
                            </div>
                          </div>
                          <Switch 
                            checked={pushNotifications}
                            onCheckedChange={setPushNotifications}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div>
                      <h3 className="text-lg mb-4">Alert Types</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white">Market Alerts</p>
                            <p className="text-sm text-gray-400">Major market movements and news</p>
                          </div>
                          <Switch 
                            checked={marketAlerts}
                            onCheckedChange={setMarketAlerts}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white">Trade Alerts</p>
                            <p className="text-sm text-gray-400">Updates on your open positions</p>
                          </div>
                          <Switch 
                            checked={tradeAlerts}
                            onCheckedChange={setTradeAlerts}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white">Mission Alerts</p>
                            <p className="text-sm text-gray-400">New missions and achievements</p>
                          </div>
                          <Switch 
                            checked={missionAlerts}
                            onCheckedChange={setMissionAlerts}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </TabsContent>

              {/* Preferences Settings */}
              <TabsContent value="preferences">
                <div className="space-y-6">
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Palette className="w-5 h-5 text-[#00ff88]" />
                      <h2 className="text-xl">Appearance</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white">Dark Mode</p>
                          <p className="text-sm text-gray-400">Use dark theme (recommended)</p>
                        </div>
                        <Switch 
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                        />
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg">
                        <Label className="mb-3 block">Chart Color Scheme</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Green/Red', 'Blue/Orange', 'Purple/Yellow'].map((scheme) => (
                            <button
                              key={scheme}
                              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                            >
                              {scheme}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Globe className="w-5 h-5 text-[#00ff88]" />
                      <h2 className="text-xl">Language & Region</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <select
                          id="language"
                          className="mt-2 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[#00ff88] focus:outline-none"
                        >
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          className="mt-2 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[#00ff88] focus:outline-none"
                        >
                          <option>UTC-8 (Pacific Time)</option>
                          <option>UTC-5 (Eastern Time)</option>
                          <option>UTC+0 (GMT)</option>
                          <option>UTC+1 (CET)</option>
                        </select>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security">
                <div className="space-y-6">
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Lock className="w-5 h-5 text-[#00ff88]" />
                      <h2 className="text-xl">Password & Authentication</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          className="mt-2 bg-white/5 border-white/10"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            className="mt-2 bg-white/5 border-white/10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            className="mt-2 bg-white/5 border-white/10"
                          />
                        </div>
                      </div>

                      <Button className="bg-[#00ff88] text-black hover:bg-[#00ff88]/90">
                        Update Password
                      </Button>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Shield className="w-5 h-5 text-[#00ff88]" />
                      <h2 className="text-xl">Two-Factor Authentication</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white mb-1">Enable 2FA</p>
                        <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                      </div>
                      <Switch 
                        checked={twoFactor}
                        onCheckedChange={setTwoFactor}
                      />
                    </div>

                    {twoFactor && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg"
                      >
                        <p className="text-sm text-gray-300 mb-3">
                          Scan this QR code with your authenticator app
                        </p>
                        <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-3" />
                        <p className="text-sm text-center text-gray-400">Or enter code: XXXX-XXXX-XXXX</p>
                      </motion.div>
                    )}
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Eye className="w-5 h-5 text-[#00ff88]" />
                      <h2 className="text-xl">Active Sessions</h2>
                    </div>

                    <div className="space-y-3">
                      {[
                        { device: 'Chrome on MacBook Pro', location: 'San Francisco, CA', current: true },
                        { device: 'Safari on iPhone', location: 'San Francisco, CA', current: false }
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white">{session.device}</p>
                              {session.current && (
                                <span className="px-2 py-0.5 bg-[#00ff88]/20 text-[#00ff88] text-xs rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{session.location}</p>
                          </div>
                          {!session.current && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-[#ff0055]/20 border-[#ff0055] text-[#ff0055] hover:bg-[#ff0055]/30"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6 border-[#ff0055]/30">
                    <div className="flex items-center gap-3 mb-6">
                      <Trash2 className="w-5 h-5 text-[#ff0055]" />
                      <h2 className="text-xl text-[#ff0055]">Danger Zone</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#ff0055]/10 border border-[#ff0055]/30 rounded-lg">
                        <div>
                          <p className="text-white mb-1">Delete Account</p>
                          <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                        </div>
                        <Button 
                          variant="outline"
                          className="bg-[#ff0055]/20 border-[#ff0055] text-[#ff0055] hover:bg-[#ff0055]/30"
                        >
                          Delete
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white mb-1">Sign Out</p>
                          <p className="text-sm text-gray-400">Sign out from this device</p>
                        </div>
                        <Button 
                          variant="outline"
                          className="bg-white/5 border-white/10"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
