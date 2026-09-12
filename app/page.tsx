'use client';

import React, { useState } from 'react';
import { HandoffItem, ActiveBlocker, OfficePresence, TeamMember, TimelineEvent } from '@/lib/types';
import { INITIAL_BLOCKERS, INITIAL_HANDOFF_QUEUE, INITIAL_OFFICES, INITIAL_TIMELINE } from '@/lib/mock-data';
import { Header } from '@/components/Header';
import { WhileYouWereAway } from '@/components/WhileYouWereAway';
import { HandoffQueue } from '@/components/HandoffQueue';
import { BlockerMatrix } from '@/components/BlockerMatrix';
import { GlobalTeamPresence } from '@/components/GlobalTeamPresence';
import { ProjectMemorySearch } from '@/components/ProjectMemorySearch';
import { ChronologicalProjectFeed } from '@/components/ChronologicalProjectFeed';
import { PassBatonModal } from '@/components/PassBatonModal';
import { ArrowRight, Clock } from 'lucide-react';

export default function Page() {
  // App Data State
  const [offices, setOffices] = useState<OfficePresence[]>(INITIAL_OFFICES);
  const [handoffQueue, setHandoffQueue] = useState<HandoffItem[]>(INITIAL_HANDOFF_QUEUE);
  const [blockers, setBlockers] = useState<ActiveBlocker[]>(INITIAL_BLOCKERS);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE);

  // Current active user persona (Default: Sarah Chen in New York)
  const allMembers = offices.flatMap((o) => o.members);
  const [currentUser, setCurrentUser] = useState<TeamMember>(allMembers[0]);

  // Modal State
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers
  const handleDispatchHandoff = (item: HandoffItem) => {
    setHandoffQueue((prev) => [item, ...prev]);

    // Add to project feed
    const newEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      project: item.project,
      author: item.owner,
      authorLocation: item.ownerLocation,
      authorRole: currentUser.role,
      type: 'handoff',
      content: `${item.accomplished} (Next: ${item.nextAction})`,
      timestamp: 'Just now',
      badgeText: 'Baton Passed',
    };
    setTimelineEvents((prev) => [newEvent, ...prev]);

    // If blocked, add to blocker matrix
    if (item.blocked && item.blocked.trim().length > 5) {
      const newBlocker: ActiveBlocker = {
        id: `blk-${Date.now()}`,
        project: item.project,
        waitingOn: item.recipient,
        waitingOnRole: 'Incoming Shift Lead',
        waitingOnLocation: item.recipientLocation,
        waitingOnStatus: 'available',
        need: item.blocked,
        urgency: 'critical',
        sinceTime: 'Just now',
        unblockActionHint: 'Dispatched via baton pass; incoming team alerted.',
      };
      setBlockers((prev) => [newBlocker, ...prev]);
    }

    showToast(`Baton passed successfully to ${item.recipient} in ${item.recipientLocation}!`);
  };

  const handleAcceptBaton = (item: HandoffItem) => {
    setHandoffQueue((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'in_progress' } : i))
    );
    showToast(`You picked up the Baton for: "${item.title}"`);
  };

  const handleCompleteQueueItem = (id: string) => {
    setHandoffQueue((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'completed' } : i))
    );
    showToast('Handoff item marked as completed!');
  };

  const handleNudgeBlocker = (blocker: ActiveBlocker) => {
    showToast(`Friendly nudge sent to ${blocker.waitingOn} (${blocker.waitingOnLocation})`);
  };

  const handleResolveBlocker = (id: string) => {
    setBlockers((prev) => prev.filter((b) => b.id !== id));
    showToast('Blocker marked as resolved!');
  };

  const handleToggleMemberStatus = (memberId: string) => {
    setOffices((prev) =>
      prev.map((off) => ({
        ...off,
        members: off.members.map((m) => {
          if (m.id === memberId) {
            const nextStatus =
              m.status === 'working'
                ? 'available'
                : m.status === 'available'
                ? 'meeting'
                : m.status === 'meeting'
                ? 'offline'
                : 'working';
            return { ...m, status: nextStatus };
          }
          return m;
        }),
      }))
    );
    showToast('Updated team member status');
  };

  return (
    <div
      id="baton-root-container"
      className="min-h-screen bg-[#192231] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950"
    >
      {/* 1. Header with quick user switcher and Pass the Baton CTA */}
      <Header
        currentUser={currentUser}
        onUserChange={(u) => setCurrentUser(u)}
        availableUsers={allMembers}
        onPassBatonClick={() => setIsPassModalOpen(true)}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Simplified End-of-Shift Reminder Banner */}
        <div className="rounded-2xl border border-[#364663] bg-[#243044] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Your Shift: {currentUser.city}
                </span>
                <span className="text-slate-400 text-xs">• 1h 45m remaining</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
                Wrapping up soon, {currentUser.name.split(' ')[0]}?
              </h2>
              <p className="text-xs text-slate-300">
                Record your 30-second handoff so colleagues in other timezones can pick up right where you leave off.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPassModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <span>Pass the Baton</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Overnight Catch-Up: While You Were Away */}
        <WhileYouWereAway
          onActionClick={(type) => {
            if (type === 'blocked') {
              document.getElementById('active-blocker-matrix')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              document.getElementById('pending-handoff-queue')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* 3. Core Operational 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2/3 width) - Work Items & Blockers */}
          <div className="lg:col-span-2 space-y-6">
            {/* The Handoff Queue: What needs action */}
            <HandoffQueue
              items={handoffQueue}
              onAcceptBaton={handleAcceptBaton}
              onCompleteItem={handleCompleteQueueItem}
            />

            {/* Blockers Waiting on Others */}
            <BlockerMatrix
              blockers={blockers}
              onNudge={handleNudgeBlocker}
              onResolve={handleResolveBlocker}
            />

            {/* Instant AI Memory Search */}
            <ProjectMemorySearch
              timelineEvents={timelineEvents}
            />
          </div>

          {/* Right Column (1/3 width) - Global Presence & Activity Timeline */}
          <div className="space-y-6">
            {/* Can I reach this person right now? */}
            <GlobalTeamPresence
              offices={offices}
              onToggleStatus={handleToggleMemberStatus}
            />

            {/* Simple Chronological Activity Stream */}
            <ChronologicalProjectFeed
              events={timelineEvents}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#364663] bg-[#1e2738] py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Baton — Seamless 24/7 team handoffs across Tokyo, London, and New York</span>
          <span className="text-slate-400 text-[11px]">Simple • Actionable • Zero status report friction</span>
        </div>
      </footer>

      {/* Interactive Modal */}
      <PassBatonModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        currentUser={currentUser}
        onDispatchHandoff={handleDispatchHandoff}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#243044] text-white shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
