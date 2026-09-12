'use client';

import React, { useState } from 'react';
import { DesignTheme, ExamplePreset, HandoffItem, TeamMember } from '@/lib/types';
import { EXAMPLE_PRESETS } from '@/lib/mock-data';
import { X, Sparkles, ArrowRight, Check, RefreshCw, Send, FileText, AlertOctagon, ArrowUpRight } from 'lucide-react';

interface PassBatonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeamMember;
  onDispatchHandoff: (item: HandoffItem) => void;
}

export function PassBatonModal({
  isOpen,
  onClose,
  currentUser,
  onDispatchHandoff,
}: PassBatonModalProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('marketing');
  
  // Custom input state
  const [customRole, setCustomRole] = useState(currentUser.role || 'Design Lead');
  const [customWork, setCustomWork] = useState('Finished slides 1–18 of client presentation deck and updated brand kit graphics.');
  const [customBlocker, setCustomBlocker] = useState('Waiting on New York commercial team to approve final tier 2 pricing.');
  const [customNext, setCustomNext] = useState('Sarah should add pricing and finish slides 19–22 before the client meeting.');

  // AI Generated / Editable review state
  const [accomplished, setAccomplished] = useState(EXAMPLE_PRESETS[0].accomplished);
  const [blocked, setBlocked] = useState(EXAMPLE_PRESETS[0].blocked);
  const [nextAction, setNextAction] = useState(EXAMPLE_PRESETS[0].nextAction);
  const [projectName, setProjectName] = useState('Client Presentation Deck');
  const [recipient, setRecipient] = useState('Sarah Chen (New York)');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: ExamplePreset) => {
    setSelectedPresetId(preset.id);
    setAccomplished(preset.accomplished);
    setBlocked(preset.blocked);
    setNextAction(preset.nextAction);
    setProjectName(preset.name);
    setRecipient(preset.to);
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-handoff',
          payload: {
            department: customRole,
            rawWork: customWork,
            rawBlocker: customBlocker,
            rawNext: customNext,
          },
        }),
      });
      const data = await res.json();
      if (data.accomplished) setAccomplished(data.accomplished);
      if (data.blocked) setBlocked(data.blocked);
      if (data.nextAction) setNextAction(data.nextAction);
    } catch {
      // Fallback
      setAccomplished(customWork);
      setBlocked(customBlocker);
      setNextAction(customNext);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitHandoff = () => {
    const newItem: HandoffItem = {
      id: `hq-${Date.now()}`,
      priority: 'high',
      project: projectName,
      title: nextAction.slice(0, 60),
      owner: currentUser.name,
      ownerLocation: currentUser.city,
      recipient: recipient.split('(')[0].trim() || 'Next Shift',
      recipientLocation: recipient.includes('New York') ? 'New York' : recipient.includes('London') ? 'London' : 'Tokyo',
      status: 'pending',
      time: 'Just now',
      accomplished,
      blocked,
      nextAction,
    };

    onDispatchHandoff(newItem);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="pass-the-baton-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="pass-the-baton-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto bg-[#243044] border-[#364663] text-slate-100"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b pb-4 border-[#364663]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                End-of-Shift Context Relay
              </span>
            </div>
            <h2 className="text-2xl font-black mt-1 text-white">
              Pass the Baton
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Package your day’s progress so the incoming timezone can continue with zero lost context.
            </p>
          </div>

          <button
            id="btn-close-pass-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1e2739] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector: Quick Corporate Presets vs Custom Work */}
        <div className="mt-5 flex items-center justify-between border-b pb-3 border-[#364663]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-[#1e2739] border border-transparent'
              }`}
            >
              1-Click Role Presets (5 Teams)
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-[#1e2739] border border-transparent'
              }`}
            >
              Write Custom Handoff
            </button>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            3-Question Format
          </span>
        </div>

        {/* Tab 1: Corporate Presets from Section 5 of user prompt */}
        {activeTab === 'presets' && (
          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select a Team Preset:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {EXAMPLE_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400'
                        : 'border-[#394a69] hover:border-slate-400 bg-[#1e2739]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">
                        {preset.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {preset.from} → {preset.to}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Work done */}
        {activeTab === 'custom' && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                What did you work on today? (Documents, decks, spreadsheets, tasks)
              </label>
              <textarea
                value={customWork}
                onChange={(e) => setCustomWork(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-[#394a69] bg-[#1e2739] text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                placeholder="e.g. Finished presentation slides 1-18, updated product revenue models..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  What is blocking you or waiting on?
                </label>
                <input
                  type="text"
                  value={customBlocker}
                  onChange={(e) => setCustomBlocker(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#394a69] bg-[#1e2739] text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  placeholder="e.g. Waiting for NYC team to confirm final pricing"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  What should happen next?
                </label>
                <input
                  type="text"
                  value={customNext}
                  onChange={(e) => setCustomNext(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#394a69] bg-[#1e2739] text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  placeholder="e.g. Sarah should add pricing and complete slides 19-22"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Format with AI Assistant</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Baton Preview & Edit Section: The 3 Core Output Fields */}
        <div className="mt-6 pt-5 border-t border-[#364663] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span>Standardized 3-Part Handoff</span>
              <span className="text-[11px] font-normal text-slate-400">
                (Review & customize before sending)
              </span>
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">Baton Protocol</span>
          </div>

          {/* 1. ACCOMPLISHED */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-[#1b2b2b]">
            <label className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>1. ACCOMPLISHED (What was finished?)</span>
              </span>
            </label>
            <textarea
              value={accomplished}
              onChange={(e) => setAccomplished(e.target.value)}
              rows={2}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#394a69] bg-[#1e2739] text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {/* 2. BLOCKED */}
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-[#2d1c24]">
            <label className="flex items-center justify-between text-xs font-bold text-rose-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>2. BLOCKED (What is stopping progress?)</span>
              </span>
            </label>
            <textarea
              value={blocked}
              onChange={(e) => setBlocked(e.target.value)}
              rows={2}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#394a69] bg-[#1e2739] text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>

          {/* 3. NEXT ACTION */}
          <div className="p-3.5 rounded-xl border border-sky-500/30 bg-[#1c293d]">
            <label className="flex items-center justify-between text-xs font-bold text-sky-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-sky-400" />
                <span>3. NEXT ACTION (What should happen next?)</span>
              </span>
            </label>
            <textarea
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              rows={2}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#394a69] bg-[#1e2739] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-[#364663] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            Passing from <strong className="text-white">{currentUser.name} ({currentUser.city})</strong> to <strong className="text-emerald-300">{recipient}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#394a69] text-slate-300 hover:bg-[#1e2739] transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-pass-baton"
              onClick={handleSubmitHandoff}
              disabled={isSubmitted}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-all ${
                isSubmitted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
              }`}
            >
              {isSubmitted ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Baton Passed to Incoming Team!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Handoff & Pass Baton</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
