"use client";

import React, { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import { Settings2, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(res => {
      setSettings(res);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings);
      alert("Settings saved successfully.");
    } catch(e) {
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white animate-pulse">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto pt-12 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <Settings2 className="w-8 h-8 text-cyan-400" />
        <h1 className="text-3xl font-bold text-white">Company Profile</h1>
      </div>

      <GlassCard className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Company Name</label>
              <input 
                type="text" 
                value={settings.company_name} 
                onChange={e => setSettings({...settings, company_name: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Industry Sector</label>
              <input 
                type="text" 
                value={settings.industry} 
                onChange={e => setSettings({...settings, industry: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Target Reduction (%)</label>
              <input 
                type="number" 
                value={settings.target_reduction_pct} 
                onChange={e => setSettings({...settings, target_reduction_pct: parseFloat(e.target.value)})}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Baseline Year</label>
              <input 
                type="number" 
                value={settings.baseline_year} 
                onChange={e => setSettings({...settings, baseline_year: parseInt(e.target.value)})}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-cyan-50 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Profile
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
