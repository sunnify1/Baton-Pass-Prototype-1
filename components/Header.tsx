'use client';

import React, { useState, useEffect } from 'react';
import { TeamMember } from '@/lib/types';
import { Globe, User, ArrowRight, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentUser: TeamMember;
  onUserChange: (user: TeamMember) => void;
  availableUsers: TeamMember[];
  onPassBatonClick: () => void;
}

export function Header({
  currentUser,
  onUserChange,
  availableUsers,
  onPassBatonClick,
}: HeaderProps) {
  const [timeState, setTimeState] = useState({
    ny: '11:21 AM EDT',
    ldn: '4:21 PM BST',
    tky: '12:21 AM JST',
  });

  useEffect(() => {
    const updateTimes = () => {
      try {
        const now = new Date();
        const ny =
          now.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' EDT';
        const ldn =
          now.toLocaleTimeString('en-US', {
            timeZone: 'Europe/London',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' BST';
        const tky =
          now.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Tokyo',
            hour: '2-digit',
            minute: '2-digit',
          }) + ' JST';
        setTimeState({ ny, ldn, tky });
      } catch {
        // Safe fallback
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 bg-[#243044] border-b border-[#364663] text-slate-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            {/* Baton Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-md ring-1 ring-emerald-400/40">
              <span className="inline-block transform -rotate-12 font-mono text-xl tracking-tighter">
                {'//'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>BATON</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Global Relay
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 hidden sm:block">
                When your workday ends, your context doesn’t.
              </p>
            </div>
          </div>

          {/* Quick pass button for mobile */}
          <div className="md:hidden">
            <button
              onClick={onPassBatonClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
              <span>Pass Baton</span>
            </button>
          </div>
        </div>

        {/* Global Live Clocks */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-[#394a69] bg-[#1e2739] text-xs text-slate-300">
          <Globe className="w-3.5 h-3.5 text-emerald-400 opacity-80" />
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-bold text-slate-200">New York</span>
            <span className="text-slate-400 font-mono text-[11px]">{timeState.ny}</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-bold text-slate-200">London</span>
            <span className="text-slate-400 font-mono text-[11px]">{timeState.ldn}</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-bold text-slate-200">Tokyo</span>
            <span className="text-slate-400 font-mono text-[11px]">{timeState.tky}</span>
          </div>
        </div>

        {/* User Identity switcher and Primary "Pass the Baton" CTA */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Active View / Persona Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 hidden sm:inline">Viewing as:</span>
            <div className="relative">
              <select
                id="select-user-persona"
                value={currentUser.id}
                onChange={(e) => {
                  const found = availableUsers.find((u) => u.id === e.target.value);
                  if (found) onUserChange(found);
                }}
                className="text-xs font-semibold rounded-xl px-3 py-2 border border-[#394a69] bg-[#1e2739] text-slate-200 hover:border-slate-500 appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-[#1e2739] text-slate-200">
                    {u.name} ({u.city} • {u.role})
                  </option>
                ))}
              </select>
              <User className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            id="btn-pass-the-baton"
            onClick={onPassBatonClick}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md hover:shadow-emerald-500/20 cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse" />
            <span>Pass the Baton</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
