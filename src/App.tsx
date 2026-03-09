/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Send, 
  Twitter, 
  MessageSquare, 
  Ghost, 
  Music2, 
  ExternalLink, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Copy,
  Share2,
  AlertCircle,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Platform = 'instagram' | 'facebook' | 'youtube' | 'telegram' | 'twitter' | 'threads' | 'snapchat' | 'tiktok';

interface Task {
  platform: Platform;
  url: string;
}

interface Config {
  tasks: Task[];
  targetUrl: string;
}

const PLATFORMS: { value: Platform; label: string; icon: React.ElementType }[] = [
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'telegram', label: 'Telegram', icon: Send },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'threads', label: 'Threads', icon: MessageSquare },
  { value: 'snapchat', label: 'Snapchat', icon: Ghost },
  { value: 'tiktok', label: 'TikTok', icon: Music2 },
];

export default function App() {
  const [mode, setMode] = useState<'setup' | 'unlocker'>('setup');
  const [config, setConfig] = useState<Config>({
    tasks: [
      { platform: 'instagram', url: '' },
      { platform: 'facebook', url: '' },
      { platform: 'youtube', url: '' },
    ],
    targetUrl: '',
  });

  const [taskStatus, setTaskStatus] = useState<boolean[]>([false, false, false]);
  const [timers, setTimers] = useState<(number | null)[]>([null, null, null]);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Check for data in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        if (decoded.tasks && decoded.targetUrl) {
          setConfig(decoded);
          setMode('unlocker');
        }
      } catch (e) {
        console.error('Failed to decode config from URL', e);
      }
    }
  }, []);

  const handleTaskChange = (index: number, field: keyof Task, value: string) => {
    const newTasks = [...config.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setConfig({ ...config, tasks: newTasks });
  };

  const startLocking = () => {
    if (!config.targetUrl) {
      alert("Please enter the main target URL!");
      return;
    }
    if (config.tasks.some(t => !t.url)) {
      alert("Please enter all task URLs!");
      return;
    }

    // Generate shareable URL
    const data = btoa(JSON.stringify(config));
    const url = new URL(window.location.href);
    url.searchParams.set('data', data);
    setShareUrl(url.toString());
    setMode('unlocker');
  };

  const handleTaskClick = (index: number) => {
    if (taskStatus[index] || timers[index] !== null) return;

    window.open(config.tasks[index].url, '_blank');
    
    setTimers(prev => {
      const next = [...prev];
      next[index] = 10;
      return next;
    });

    const interval = setInterval(() => {
      setTimers(prev => {
        const next = [...prev];
        if (next[index] !== null && next[index]! > 0) {
          next[index]! -= 1;
          return next;
        } else {
          clearInterval(interval);
          setTaskStatus(ts => {
            const nts = [...ts];
            nts[index] = true;
            return nts;
          });
          return next;
        }
      });
    }, 1000);
  };

  const allTasksDone = taskStatus.every(s => s);

  const finalUnlock = () => {
    if (allTasksDone) {
      let url = config.targetUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      alert("Link Unlocked Successfully!");
      window.location.href = url;
    }
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert("Share URL copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold text-sky-400 tracking-widest uppercase">
              Follow To Unlock
            </span>
            {mode === 'unlocker' && (
              <button 
                onClick={() => {
                  setMode('setup');
                  setTaskStatus([false, false, false]);
                  setTimers([null, null, null]);
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase"
              >
                Reset
              </button>
            )}
          </div>

          <div className="h-px bg-slate-800 w-full mb-8" />

          <AnimatePresence mode="wait">
            {mode === 'setup' ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <p className="text-sm text-slate-400 text-center">
                  Grow your Subscribers and Followers with Unlock Links 🥳
                </p>

                {config.tasks.map((task, i) => (
                  <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <select 
                        value={task.platform}
                        onChange={(e) => handleTaskChange(i, 'platform', e.target.value as Platform)}
                        className="flex-1 bg-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                      >
                        {PLATFORMS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="url"
                      placeholder={`Paste ${task.platform} URL`}
                      value={task.url}
                      onChange={(e) => handleTaskChange(i, 'url', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Target URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="url"
                      placeholder="Paste the URL to be unlocked"
                      value={config.targetUrl}
                      onChange={(e) => setConfig({ ...config, targetUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button 
                  onClick={startLocking}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-sky-900/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Generate Link
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="unlocker"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/10 mb-4">
                    <Lock className="w-8 h-8 text-sky-500" />
                  </div>
                  <h2 className="text-xl font-bold">Complete Tasks to Unlock</h2>
                  <p className="text-sm text-slate-400 mt-1">Visit each link and wait for the timer</p>
                </div>

                {config.tasks.map((task, i) => {
                  const PlatformIcon = PLATFORMS.find(p => p.value === task.platform)?.icon || Globe;
                  const isDone = taskStatus[i];
                  const timer = timers[i];

                  return (
                    <button
                      key={i}
                      onClick={() => handleTaskClick(i)}
                      disabled={isDone || timer !== null}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isDone 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : timer !== null
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-white hover:bg-slate-100 text-slate-900 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDone ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white'}`}>
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : <PlatformIcon className="w-5 h-5" />}
                        </div>
                        <span className="font-bold text-sm">
                          {isDone ? 'Completed' : `${task.platform === 'youtube' ? 'Subscribe' : 'Follow'} on ${task.platform.charAt(0).toUpperCase() + task.platform.slice(1)}`}
                        </span>
                      </div>
                      
                      {timer !== null && !isDone && (
                        <span className="text-xs font-mono bg-slate-950 px-3 py-1 rounded-full text-sky-400 border border-sky-500/30">
                          {timer}s
                        </span>
                      )}
                      
                      {!isDone && timer === null && (
                        <ExternalLink className="w-4 h-4 opacity-50" />
                      )}
                    </button>
                  );
                })}

                <button 
                  onClick={finalUnlock}
                  disabled={!allTasksDone}
                  className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 ${
                    allTasksDone 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {allTasksDone ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  UNLOCK LINK
                </button>

                {shareUrl && (
                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 text-center">Share this locked link</p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-400 truncate flex items-center">
                        {shareUrl}
                      </div>
                      <button 
                        onClick={copyShareUrl}
                        className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-6 border-t border-slate-800 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Any problem? Contact support</span>
            </div>
            <a 
              href="mailto:sagnikmandal500@gmail.com" 
              className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
            >
              sagnikmandal500@gmail.com
            </a>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Easy to use and all social media platform links available.<br />
              <span className="text-slate-400 font-bold mt-2 block uppercase tracking-widest">
                made by ©sagnik ❤️
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
