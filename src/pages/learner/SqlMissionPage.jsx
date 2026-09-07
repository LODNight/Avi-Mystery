import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock, Database, Target, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { SchemaBrowser } from '../../components/sql/SchemaBrowser.jsx'
import { SqlEditor } from '../../components/sql/SqlEditor.jsx'
import { ResultViewer } from '../../components/sql/ResultViewer.jsx'
import { WorkspaceSplitPane } from '../../components/workspace/WorkspaceSplitPane.jsx'
import { ProblemPane } from '../../components/workspace/ProblemPane.jsx'
import { MissionActionBar } from '../../components/workspace/MissionActionBar.jsx'
import { ErrorState } from '../../components/ui/EmptyState.jsx'
import { Skeleton, SqlMissionSkeleton } from '../../components/ui/Skeleton.jsx'
import { MissionResultModal } from '../../components/excel/MissionResultModal.jsx'
import { sqlMissionService, submissionService as defaultSubmissionService, missionService } from '../../services/index.js'
import { createSqlEngine } from '../../utils/sql/index.js'
import { formatDuration, formatXP } from '../../utils/format.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useProgress } from '../../hooks/useProgress.js'
import { FEATURE_FLAGS } from '../../config/envConfig.js'
import { isAdmin } from '../../constants/roles.js'

const DEFAULT_SQL = '-- Viết câu lệnh SQL của bạn tại đây...\n'

function WorkspaceSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-label="Đang tải SQL mission">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-10 w-2/3" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

export function SqlMissionPage({
  workspaceService = sqlMissionService,
  subService = defaultSubmissionService,
  engineFactory = createSqlEngine,
}) {
  const { missionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isPractice = location.state?.mode === 'practice'
  const engineRef = useRef(null)
  
  const { user } = useAuth()
  const { progressList, awardXp } = useProgress(user?.id)
  const isDevUser = isAdmin(user?.role) || (typeof FEATURE_FLAGS !== 'undefined' && FEATURE_FLAGS.enableDevShortcuts)

  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ phase: 'loading', workspace: null, schema: null, error: null })
  const [query, setQuery] = useState('')
  const [executionResult, setExecutionResult] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [submissionError, setSubmissionError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [adjacentMissions, setAdjacentMissions] = useState({ prev: null, next: null })

  const disposeCurrentEngine = useCallback(async () => {
    const engine = engineRef.current
    engineRef.current = null
    if (engine) {
      try {
        await engine.dispose()
      } catch {
        // Teardown must not prevent a new mission from loading.
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState({ phase: 'loading', workspace: null, schema: null, error: null })
      setExecutionResult(null)
      setIsExecuting(false)
      setIsSubmitting(false)
      setSubmissionResult(null)
      setSubmissionError(null)
      setIsModalOpen(false)
      await disposeCurrentEngine()
      if (cancelled) return

      const workspaceResult = await workspaceService.loadWorkspace(missionId)
      if (cancelled) return
      if (workspaceResult.error || !workspaceResult.data) {
        setState({
          phase: 'error', workspace: null, schema: null,
          error: workspaceResult.error || { message: 'Không thể tải nội dung SQL mission.' },
        })
        return
      }

      const engine = engineFactory()
      engineRef.current = engine
      try {
        await engine.initialize()
        await engine.loadDataset(workspaceResult.data.dataset)
        const schema = await engine.getSchema({ sampleRowLimit: 3 })
        setQuery(DEFAULT_SQL)
        setState({ phase: 'ready', workspace: workspaceResult.data, schema, error: null })

        // Tải danh sách nhiệm vụ cùng chương để hỗ trợ điều hướng trước/sau
        if (workspaceResult.data?.mission?.chapterId) {
          try {
            const chapRes = await missionService.getMissionsByChapter(workspaceResult.data.mission.chapterId);
            if (chapRes?.data && chapRes.data.length > 0) {
              const list = chapRes.data;
              const idx = list.findIndex((m) => m.id === workspaceResult.data.mission.id);
              const prevM = idx > 0 ? list[idx - 1] : null;
              const nextM = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
              if (!cancelled) {
                setAdjacentMissions({ prev: prevM, next: nextM });
              }
            }
          } catch {
            // Bỏ qua lỗi phụ trợ
          }
        }
      } catch (error) {
        if (cancelled) return
        setState({
          phase: 'error', workspace: null, schema: null,
          error: { message: error?.message || 'Không thể khởi tạo SQL engine.', retryable: true },
        })
      }
    }

    void load()
    return () => {
      cancelled = true
      void disposeCurrentEngine()
    }
  }, [attempt, disposeCurrentEngine, engineFactory, missionId, workspaceService])

  if (state.phase === 'loading') return <SqlMissionSkeleton />;
  if (state.phase === 'error') {
    return (
      <ErrorState
        className="mx-auto max-w-7xl rounded-3xl border border-border bg-card"
        message={state.error?.message}
        onRetry={state.error?.retryable === false ? undefined : () => setAttempt((value) => value + 1)}
      />
    )
  }

  const { mission } = state.workspace
  const starterSql = mission?.starterContent?.starterSql || 'SELECT * FROM sales;'

  const isMissionCompleted = Boolean(
    progressList?.some((p) => p.contentId === mission?.id && p.status === 'completed') ||
    (submissionResult?.isCorrect && (submissionResult?.stepCompleted || submissionResult?.missionCompleted))
  )

  const handleRun = async () => {
    if (isExecuting || isSubmitting) return
    const engine = engineRef.current
    if (!engine) return

    setIsExecuting(true)
    setSubmissionError(null)
    try {
      const res = await engine.execute(query, { maxRows: 500 })
      setExecutionResult(res)
    } catch (error) {
      setExecutionResult({
        columns: [],
        rows: [],
        rowCount: 0,
        executionMs: 0,
        errorCode: error?.code || 'SQL_RUNTIME_ERROR',
        message: error?.message || 'Không thể thực thi truy vấn SQL.',
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleReset = () => {
    setQuery(DEFAULT_SQL)
    setExecutionResult(null)
    setSubmissionResult(null)
    setSubmissionError(null)
  }

  const handleSubmit = async () => {
    if (isSubmitting || isExecuting) return

    let currentExec = executionResult
    if (!currentExec) {
      const engine = engineRef.current
      if (!engine) return
      setIsExecuting(true)
      try {
        currentExec = await engine.execute(query, { maxRows: 500 })
        setExecutionResult(currentExec)
      } catch (err) {
        currentExec = {
          columns: [],
          rows: [],
          rowCount: 0,
          executionMs: 0,
          errorCode: err?.code || 'SQL_RUNTIME_ERROR',
          message: err?.message || 'Không thể thực thi truy vấn SQL.',
        }
        setExecutionResult(currentExec)
      } finally {
        setIsExecuting(false)
      }
    }

    setIsSubmitting(true)
    setSubmissionError(null)

    const clientAttemptId = `sql-attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    try {
      const res = await subService.submit({
        mode: isPractice ? 'practice' : 'submit',
        missionId: mission.id,
        tool: 'sql',
        answer: {
          query,
          executionResult: currentExec,
        },
        hintsUsed: 0,
        clientAttemptId,
      })

      if (res.error) {
        setSubmissionError(res.error)
        setSubmissionResult(null)
      } else {
        // --- Progress & XP Integration Boundary (Optimistic) ---
        if (res.data) {
          const isAlreadyCompleted = progressList.some(p => p.contentId === mission.id && p.status === 'completed');
          const optimisticXpAwarded = isAlreadyCompleted ? 0 : (res.data.potentialXp || 50);
          const optimisticIsFirstCompletion = !isAlreadyCompleted;

          const initialSubmissionResult = {
            ...res.data,
            optimisticXp: optimisticXpAwarded,
            isFirstCompletion: optimisticIsFirstCompletion,
            persistenceStatus: 'pending',
          };

          setSubmissionResult(initialSubmissionResult);
          setSubmissionError(null);

          if (res.data?.isCorrect && (res.data?.stepCompleted || res.data?.missionCompleted)) {
            setIsModalOpen(true);
          }

          // Background Persistence
          awardXp({
            contentId: mission.id,
            contentType: 'question',
            mode: isPractice ? 'practice' : 'main_quest',
            submissionResult: res.data,
            hintsUsed: 0,
          }).then(progressRes => {
            if (progressRes?.error) {
              setSubmissionResult(prev => prev ? { ...prev, persistenceStatus: 'failed' } : prev);
            } else if (progressRes?.data) {
              setSubmissionResult(prev => prev ? {
                ...prev,
                xpAwarded: progressRes.data.xpAwarded,
                isFirstCompletion: progressRes.data.isFirstCompletion,
                persistenceStatus: 'saved',
              } : prev);
            }
          }).catch(() => {
            setSubmissionResult(prev => prev ? { ...prev, persistenceStatus: 'failed' } : prev);
          });
        } else {
          setSubmissionResult(res.data);
          setSubmissionError(null);
        }
      }
    } catch (error) {
      setSubmissionError({
        code: 'SUBMISSION_FAILED',
        message: error?.message || 'Có lỗi xảy ra khi gửi bài làm.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-h-[calc(100vh-4.5rem)] overflow-hidden bg-background text-foreground animate-fade-in">
      <WorkspaceSplitPane
        className="flex-1 min-h-0"
        leftTitle="Hồ sơ SQL"
        rightTitle="Truy vấn & Kết quả"
        leftContent={
          <ProblemPane
            title={mission.title}
            tool="sql"
            isPractice={isPractice}
            missionId={mission.id}
            story={mission.story}
            objective={mission.objective}
            isCompleted={isMissionCompleted}
            rewardXp={mission.rewardXp || 100}
            estimatedDuration={mission.estimatedDuration}
            adjacentMissions={adjacentMissions}
            schemaSlot={
              <div className="mt-4">
                <SchemaBrowser schema={state.schema} className="min-h-[20rem]" />
              </div>
            }
          />
        }
        rightContent={
          <div className="flex flex-col h-full overflow-hidden">
            {/* Top: SQL Editor */}
            <div className="p-2 sm:p-3 border-b border-stone-200 dark:border-stone-800 shrink-0">
              <SqlEditor
                value={query}
                onChange={setQuery}
                onRun={handleRun}
                onReset={handleReset}
                onDevFill={isDevUser ? () => setQuery(starterSql) : undefined}
                isRunning={isExecuting || isSubmitting}
              />
            </div>

            {/* Middle: Feedback Banners & Result Viewer (Scrollable) */}
            <div className="flex-1 overflow-auto p-2 sm:p-3 space-y-3">
              {/* Submission Feedback Banner for Incorrect Submissions */}
              {submissionResult && !submissionResult.isCorrect && (
                <div role="alert" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-medium text-amber-800 dark:text-amber-200 animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <strong className="font-bold">Chưa chính xác: </strong>
                      <span>{submissionResult.feedback}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submission Service Error Banner */}
              {submissionError && (
                <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-800 dark:text-rose-200 animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <div>
                      <strong className="font-bold">Lỗi nộp bài: </strong>
                      <span>{submissionError.message}</span>
                    </div>
                  </div>
                </div>
              )}

              <ResultViewer
                result={executionResult}
                isExecuting={isExecuting || isSubmitting}
                isCompleted={isMissionCompleted}
              />
            </div>
          </div>
        }
      />

      {/* ── LeetCode-style Isolated Action Footer ── */}
      <MissionActionBar
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isCompleted={isMissionCompleted}
        adjacentMissions={adjacentMissions}
        isPractice={isPractice}
        submitIcon="send"
      />

      <MissionResultModal
        isOpen={isModalOpen}
        result={submissionResult}
        missionTitle={mission.title}
        onClose={() => setIsModalOpen(false)}
        hasNextMission={Boolean(adjacentMissions.next)}
        onNextMission={() => {
          setIsModalOpen(false);
          if (adjacentMissions.next) {
            const nextPath = adjacentMissions.next.tool === 'sql'
              ? `/missions/${adjacentMissions.next.id}/sql`
              : `/missions/${adjacentMissions.next.id}/workspace`;
            navigate(isPractice ? `/practice?mission=${adjacentMissions.next.id}` : nextPath);
          } else {
            navigate(isPractice ? '/practice' : '/map');
          }
        }}
      />
    </div>
  )
}
