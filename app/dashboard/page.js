'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { subscribeToUserFilings } from '@/lib/db';
import { subscribeToDraftFilings } from '@/lib/draftHelpers';
import { getIncompleteFilings, formatIncompleteFiling, isIncompleteFiling } from '@/lib/filingIntelligence';
import {
  Upload,
  Edit,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Truck,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [draftFilings, setDraftFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect agents to agent dashboard
    if (!authLoading && userData?.role === 'agent') {
      router.push('/agent/dashboard');
      return;
    }

    // Only subscribe to filings when auth is done loading and user exists
    if (!authLoading && user) {
      setLoading(true);

      // Subscribe to real-time updates for submitted filings
      const unsubscribeFilings = subscribeToUserFilings(user.uid, (userFilings) => {
        setFilings(userFilings);
        setLoading(false);
      });

      // Subscribe to draft filings
      const unsubscribeDrafts = subscribeToDraftFilings(user.uid, (drafts) => {
        console.log('Received draft filings update:', drafts.length, 'drafts');
        console.log('Draft filings data:', drafts);
        setDraftFilings(drafts);
      });

      // Cleanup subscriptions on unmount
      return () => {
        unsubscribeFilings();
        unsubscribeDrafts();
      };
    } else if (!authLoading && !user) {
      // Auth is done but no user - stop loading
      setLoading(false);
    }
  }, [user, userData, authLoading, router]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'action_required':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'processing':
      case 'submitted':
        return <Clock className="w-3.5 h-3.5" />;
      case 'action_required':
        return <AlertCircle className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'processing':
        return 'Processing';
      case 'action_required':
        return 'Action Required';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Calculate filing statistics
  const stats = {
    total: filings.length,
    completed: filings.filter(f => f.status === 'completed').length,
    processing: filings.filter(f => f.status === 'processing' || f.status === 'submitted').length,
    actionRequired: filings.filter(f => f.status === 'action_required').length,
    totalVehicles: filings.reduce((sum, f) => sum + (f.vehicleIds?.length || 0), 0),
  };

  const statCards = [
    {
      label: 'Total Filings',
      value: stats.total,
      icon: FileText,
      color: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'green',
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    {
      label: 'In Progress',
      value: stats.processing,
      icon: Clock,
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    {
      label: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: Truck,
      color: 'orange',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-text)] mb-2">
            Welcome back, {userData?.displayName || user?.email?.split('@')[0] || 'there'}!
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted)]">
            Here's your Form 2290 filing overview
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-navy)] mx-auto"></div>
            <p className="mt-4 text-sm text-[var(--color-muted)]">Loading your filings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resume Incomplete Filings - ALWAYS show FIRST if drafts exist */}
            {(() => {
              // Debug logging
              console.log('=== DASHBOARD RENDER DEBUG ===');
              console.log('draftFilings state:', draftFilings);
              console.log('draftFilings.length:', draftFilings.length);
              console.log('filings state:', filings);
              
              // Combine draft filings with incomplete submitted filings
              const incomplete = getIncompleteFilings(filings);
              
              // Filter drafts to only show actual drafts (status === 'draft')
              // Also exclude drafts that might have been converted to submitted filings
              const activeDrafts = draftFilings.filter(d => {
                // Only show drafts with status 'draft'
                if (d.status !== 'draft') return false;
                
                // Check if this draft has been converted to a submitted filing
                // by comparing key identifiers (taxYear, workflowType, etc.)
                const draftMatchesFiling = filings.some(f => {
                  // For upload workflow, check if filing has same PDF or extracted data
                  if (d.workflowType === 'upload' && f.workflowType === 'upload') {
                    return d.pdfUrl && f.schedule1Url && d.pdfUrl === f.schedule1Url;
                  }
                  // For manual workflow, check tax year and filing type
                  if (d.workflowType === 'manual' && f.filingType) {
                    return d.filingData?.taxYear === f.taxYear && 
                           d.filingType === f.filingType;
                  }
                  return false;
                });
                
                // Exclude if it matches a submitted filing
                return !draftMatchesFiling;
              });
              
              // Always include active drafts, even if empty - this is important for first-time users
              const draftFilingsWithFlag = activeDrafts.map(d => ({ ...d, isDraft: true, status: d.status || 'draft' }));
              const incompleteSubmitted = incomplete.all.filter(f => f.status !== 'action_required');
              const allIncompleteFilings = [
                ...draftFilingsWithFlag,
                ...incompleteSubmitted
              ];
              
              console.log('draftFilingsWithFlag:', draftFilingsWithFlag);
              console.log('incompleteSubmitted:', incompleteSubmitted);
              console.log('allIncompleteFilings:', allIncompleteFilings);
              console.log('allIncompleteFilings.length:', allIncompleteFilings.length);
              
              // ALWAYS show section if active drafts exist - UNCONDITIONAL for first-time user experience
              // Use active drafts directly if they exist, otherwise use combined list
              const itemsToShow = activeDrafts.length > 0 ? draftFilingsWithFlag : allIncompleteFilings;
              
              console.log('activeDrafts:', activeDrafts);
              console.log('activeDrafts.length:', activeDrafts.length);
              console.log('itemsToShow:', itemsToShow);
              console.log('itemsToShow.length:', itemsToShow.length);
              console.log('Should render?', activeDrafts.length > 0 || allIncompleteFilings.length > 0);
              
              // CRITICAL: Always show if active drafts exist, regardless of other conditions
              if (activeDrafts.length > 0 || allIncompleteFilings.length > 0) {
                console.log('✅ RENDERING RESUME SECTION');
                console.log('Rendering resume section with', itemsToShow.length, 'items');
                return (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                          <RotateCcw className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-800 mb-1">Resume Your Filings</h3>
                          <p className="text-sm text-blue-700">
                            {activeDrafts.length > 0 
                              ? `You have ${activeDrafts.length} draft filing${activeDrafts.length !== 1 ? 's' : ''} that you can continue working on.`
                              : `You have ${allIncompleteFilings.length} incomplete filing${allIncompleteFilings.length !== 1 ? 's' : ''} that you can continue working on.`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {itemsToShow.slice(0, 3).map(filing => {
                          console.log('Rendering filing:', filing);
                          let formatted = formatIncompleteFiling(filing);
                          console.log('Formatted filing:', formatted);
                          
                          // Fallback if formatting fails - ALWAYS provide fallback for drafts
                          if (!formatted) {
                            console.warn('formatIncompleteFiling returned null, using fallback for:', filing);
                            // Calculate progress based on step for drafts
                            let progress = 0;
                            if (filing.step) {
                              if (filing.workflowType === 'upload') {
                                progress = filing.step === 3 ? 75 : filing.step === 2 ? 50 : 25;
                              } else {
                                progress = filing.step === 5 ? 100 : filing.step === 4 ? 80 : filing.step === 3 ? 60 : filing.step === 2 ? 40 : 20;
                              }
                            }
                            
                            formatted = {
                              id: filing.id || filing.draftId || 'unknown',
                              description: filing.workflowType === 'upload' ? 'Schedule 1 Upload' : (filing.filingType || 'Standard Filing'),
                              taxYear: filing.taxYear || filing.filingData?.taxYear || 'Unknown',
                              progress: progress,
                              status: filing.status || 'draft',
                              lastUpdated: filing.updatedAt || filing.createdAt || new Date(),
                              vehicleCount: filing.selectedVehicleIds?.length || filing.vehicleIds?.length || 0,
                              hasBusiness: !!filing.selectedBusinessId || !!filing.businessId,
                              statusLabel: 'Draft'
                            };
                            console.log('Using fallback formatted:', formatted);
                          }
                          
                          // Determine resume URL based on whether it's a draft or submitted filing
                          const resumeUrl = filing.isDraft || filing.status === 'draft'
                            ? filing.workflowType === 'upload' 
                              ? `/dashboard/upload-schedule1?draft=${filing.id || filing.draftId}`
                              : `/dashboard/new-filing?draft=${filing.id || filing.draftId}`
                            : `/dashboard/filings/${filing.id}`;
                          
                          return (
                            <Link
                              key={filing.id || filing.draftId || Math.random()}
                              href={resumeUrl}
                              className="bg-white rounded-lg border border-blue-200 p-4 hover:border-blue-400 hover:shadow-md transition group"
                            >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-[var(--color-text)] truncate">
                                    {formatted.description}
                                  </h4>
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                    {formatted.taxYear}
                                  </span>
                                  {(filing.isDraft || filing.status === 'draft') && (
                                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                                      Draft
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
                                  {formatted.vehicleCount > 0 && (
                                    <>
                                      <span>{formatted.vehicleCount} vehicle{formatted.vehicleCount !== 1 ? 's' : ''}</span>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span>{formatted.progress}% complete</span>
                                  {formatted.lastUpdated && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        {(() => {
                                          try {
                                            if (formatted.lastUpdated instanceof Date) {
                                              return formatted.lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            } else if (formatted.lastUpdated.seconds) {
                                              return new Date(formatted.lastUpdated.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            } else {
                                              return new Date(formatted.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            }
                                          } catch (e) {
                                            return 'Recently';
                                          }
                                        })()}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {/* Progress bar */}
                                <div className="mt-2 w-full bg-blue-100 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.max(0, Math.min(100, formatted.progress))}%` }}
                                  />
                                </div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition flex-shrink-0" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    {itemsToShow.length > 3 && (
                      <Link
                        href="/dashboard/filings"
                        className="mt-4 text-sm text-blue-700 hover:text-blue-800 font-medium inline-block"
                      >
                        View all {itemsToShow.length} incomplete filings →
                      </Link>
                    )}
                  </div>
                );
              }
              
              // CRITICAL FIX: If active drafts exist but section didn't render, force render them
              if (activeDrafts.length > 0) {
                console.warn('⚠️ ACTIVE DRAFTS EXIST - FORCING RENDER!', {
                  draftCount: activeDrafts.length,
                  drafts: activeDrafts
                });
                
                // Force render drafts section - this should never happen but ensures drafts always show
                return (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                        <RotateCcw className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-800 mb-1">Resume Your Filings</h3>
                        <p className="text-sm text-blue-700">
                          You have {activeDrafts.length} draft filing{activeDrafts.length !== 1 ? 's' : ''} that you can continue working on.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {draftFilingsWithFlag.slice(0, 3).map(filing => {
                        // Use direct data from draft, don't rely on formatting
                        const taxYear = filing.taxYear || filing.filingData?.taxYear || 'Unknown';
                        const vehicleCount = filing.selectedVehicleIds?.length || filing.vehicleIds?.length || 0;
                        const progress = filing.step === 3 ? 75 : filing.step === 2 ? 50 : 25;
                        const description = filing.workflowType === 'upload' ? 'Schedule 1 Upload' : (filing.filingType || 'Standard Filing');
                        const resumeUrl = filing.workflowType === 'upload' 
                          ? `/dashboard/upload-schedule1?draft=${filing.id || filing.draftId}`
                          : `/dashboard/new-filing?draft=${filing.id || filing.draftId}`;
                        
                        return (
                          <Link
                            key={filing.id || filing.draftId}
                            href={resumeUrl}
                            className="bg-white rounded-lg border border-blue-200 p-4 hover:border-blue-400 hover:shadow-md transition group"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-[var(--color-text)] truncate">
                                    {description}
                                  </h4>
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                    {taxYear}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                                    Draft
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
                                  {vehicleCount > 0 && (
                                    <>
                                      <span>{vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}</span>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span>{progress}% complete</span>
                                  {filing.updatedAt && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        {filing.updatedAt instanceof Date
                                          ? filing.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                          : new Date(filing.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="mt-2 w-full bg-blue-100 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition flex-shrink-0" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    {activeDrafts.length > 3 && (
                      <Link
                        href="/dashboard/filings"
                        className="mt-4 text-sm text-blue-700 hover:text-blue-800 font-medium inline-block"
                      >
                        View all {activeDrafts.length} draft filings →
                      </Link>
                    )}
                  </div>
                );
              }
              
              return null;
            })()}

            {/* Show "No filings yet" card if no submitted filings (but drafts can still exist) */}
            {filings.length === 0 && (
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-2">
                  {draftFilings.length > 0 ? 'Create a New Filing' : 'No filings yet'}
            </h2>
            <p className="text-sm text-[var(--color-muted)] mb-8 max-w-md mx-auto">
                  {draftFilings.length > 0 
                    ? 'Start a new Form 2290 filing request or continue with your draft above.'
                    : 'Get started by creating your first Form 2290 filing request.'
                  }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/dashboard/upload-schedule1"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
                style={{ color: '#ffffff' }}
              >
                <Upload className="w-4 h-4" />
                Upload Schedule 1 PDF
              </Link>
              <span className="text-sm text-[var(--color-muted)]">or</span>
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
                style={{ color: '#ffffff' }}
              >
                <Edit className="w-4 h-4" />
                Manual Entry
              </Link>
            </div>
            <p className="mt-6 text-xs text-[var(--color-muted)] max-w-md mx-auto">
              Upload your Schedule 1 PDF to automatically extract business and vehicle information
            </p>
          </div>
            )}

            {/* Filing Statistics Summary - Show if there are submitted filings */}
            {filings.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`${stat.bg} rounded-lg border ${stat.border} p-4 sm:p-5`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.text}`} />
                    </div>
                    <div className={`text-xl sm:text-2xl font-semibold ${stat.text} mb-1`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs sm:text-sm ${stat.text} opacity-80`}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Pending Actions Alert */}
            {stats.actionRequired > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800">Action Required</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    You have {stats.actionRequired} filing{stats.actionRequired !== 1 ? 's' : ''} that require your attention. Please review them to proceed.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {filings.filter(f => f.status === 'action_required').slice(0, 3).map(filing => (
                      <Link
                        key={filing.id}
                        href={`/dashboard/filings/${filing.id}`}
                        className="text-xs px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition font-medium"
                      >
                        Review {filing.taxYear || 'Filing'} →
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Grid - Always show */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/dashboard/new-filing"
                  className="group p-5 bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-navy)] hover:shadow-md transition flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">New 2290 Filing</h3>
                    <p className="text-xs text-[var(--color-muted)] mt-1">File for current tax year</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/new-filing?type=refund"
                  className="group p-5 bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-navy)] hover:shadow-md transition flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition">
                    <ArrowRight className="w-5 h-5 text-green-600 rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">8849 Refund</h3>
                    <p className="text-xs text-[var(--color-muted)] mt-1">Claim credits for sold/destroyed</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/new-filing?type=amendment"
                  className="group p-5 bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-navy)] hover:shadow-md transition flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition">
                    <Edit className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">Amendment</h3>
                    <p className="text-xs text-[var(--color-muted)] mt-1">Correct VIN or weight</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/upload-schedule1"
                  className="group p-5 bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-navy)] hover:shadow-md transition flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition">
                    <Upload className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">Upload Schedule 1</h3>
                    <p className="text-xs text-[var(--color-muted)] mt-1">AI-powered extraction</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity (Top 5) - Show if there are submitted filings */}
            {filings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Recent Activity</h2>
                <Link
                  href="/dashboard/filings"
                  className="text-sm text-[var(--color-navy)] hover:underline font-medium"
                >
                    View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filings.slice(0, 5).map((filing) => (
                  <Link
                    key={filing.id}
                    href={`/dashboard/filings/${filing.id}`}
                    className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4 sm:p-5 hover:border-[var(--color-navy)] hover:shadow-md transition group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">
                            Tax Year: {filing.taxYear}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(filing.status)}`}>
                            {getStatusIcon(filing.status)}
                            {getStatusLabel(filing.status)}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs sm:text-sm text-[var(--color-muted)]">
                          <p>
                            <strong className="text-[var(--color-text)]">{filing.vehicleIds?.length || 0}</strong> vehicle{filing.vehicleIds?.length !== 1 ? 's' : ''} •
                            First used: <strong className="text-[var(--color-text)]">{filing.firstUsedMonth}</strong>
                          </p>
                          {filing.createdAt && (
                            <p>
                              Submitted: <strong className="text-[var(--color-text)]">{filing.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-[var(--color-muted)] flex-shrink-0 group-hover:text-[var(--color-navy)] transition">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                ))}
                  </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
