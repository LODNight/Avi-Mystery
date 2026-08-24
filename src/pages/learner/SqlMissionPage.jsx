import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Database, Target, AlertCircle, AlertTriangle } from 'lucide-react'
import { SchemaBrowser } from '../../components/sql/SchemaBrowser.jsx'
import { SqlEditor } from '../../components/sql/SqlEditor.jsx'
import { ResultViewer } from '../../components/sql/ResultViewer.jsx'
import { ErrorState } from '../../components/ui/EmptyState.jsx'
import { Skeleton } from '../../components/ui/Skeleton.jsx'
import { MissionResultModal } from '../../components/excel/MissionResultModal.jsx'
import { sqlMissionService, submissionService as defaultSubmissionService } from '../../services/index.js'
import { createSqlEngine } from '../../utils/sql/index.js'
import { formatDuration, formatXP } from '../../utils/format.js'

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
  const engineRef = useRef(null)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ phase: 'loading', workspace: null, schema: null, error: null })
  const [query, setQuery] = useState('')
  const [executionResult, setExecutionResult] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [submissionError, setSubmissionError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        if (cancelled) return

        const initialQuery = workspaceResult.data.mission?.starterContent?.starterSql || 'SELECT * FROM sales;'
        setQuery(initialQuery)
        setState({ phase: 'ready', workspace: workspaceResult.data, schema, error: null })
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

  if (state.phase === 'loading') return <WorkspaceSkeleton />
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
    setQuery(starterSql)
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
        mode: 'submit',
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
        setSubmissionResult(res.data)
        setSubmissionError(null)
        if (res.data?.isCorrect && (res.data?.stepCompleted || res.data?.missionCompleted)) {
          setIsModalOpen(true)
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
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <Link to={`/missions/${mission.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Quay lại hồ sơ nhiệm vụ
      </Link>

      <header className="rounded-3xl border border-cyan-500/25 bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          <Database className="size-4" /> SQL Mission · Schema đã sẵn sàng
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{mission.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{mission.story}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2"><Target className="size-3.5" /> {mission.objective}</span>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2"><Clock className="size-3.5" /> {formatDuration(mission.estimatedDuration)}</span>
          <span className="rounded-xl bg-amber-500/10 px-3 py-2 font-bold text-amber-700 dark:text-amber-300">{formatXP(mission.rewardXp)}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <SqlEditor
            value={query}
            onChange={setQuery}
            onRun={handleRun}
            onReset={handleReset}
            isRunning={isExecuting || isSubmitting}
          />

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
            onSubmit={handleSubmit}
          />
        </div>

        <SchemaBrowser schema={state.schema} className="min-h-[28rem]" />
      </div>

      <MissionResultModal
        isOpen={isModalOpen}
        result={submissionResult}
        missionTitle={mission.title}
        onClose={() => setIsModalOpen(false)}
        onNextMission={() => navigate('/learning-map')}
      />
    </div>
  )
}
