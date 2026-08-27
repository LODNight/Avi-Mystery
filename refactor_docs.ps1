$oldFiles = @(
    "AGENTS.md",
    "docs\BACKLOG.md",
    "docs\CHECKLIST.md",
    "docs\DECISIONS.md",
    "docs\PROJECT_MASTER_SUMMARY.md",
    "docs\PROJECT_STATUS.md",
    "docs\ROADMAP.md",
    "docs\agent\CONTRACTS.md",
    "docs\agent\CURRENT_TASK.md",
    "docs\agent\DECISIONS.md",
    "docs\agent\INVESTIGATION_MAPPING.md",
    "docs\agent\LEARNING_MAP_CONTRACT.md",
    "docs\agent\MASTERY_CONTRACT.md",
    "docs\agent\MODULE_MAP.md",
    "docs\agent\PROGRESS_CONTRACT.md",
    "docs\agent\PROJECT_CONTEXT.md",
    "docs\agent\QUESTION_MAPPING.md",
    "docs\agent\REWARD_CONTRACT.md",
    "docs\agent\SUBMISSION_BINDING.md",
    "docs\agent\TEST_STRATEGY.md",
    "docs\agent\UI_CHANGE_INVENTORY.md",
    "docs\agent\modules\ADM.md",
    "docs\agent\modules\ANL.md",
    "docs\agent\modules\BE.md",
    "docs\agent\modules\GAME.md",
    "docs\agent\modules\LRN-EXCEL.md",
    "docs\agent\modules\LRN-SQL.md",
    "docs\agent\modules\LRN-SUB.md",
    "docs\agent\modules\SHR.md"
)

foreach ($f in $oldFiles) {
    if (Test-Path $f) {
        Remove-Item -Path $f -Force
    }
}

Move-Item -Path temp_project_context.md -Destination docs\PROJECT_CONTEXT.md -Force
Move-Item -Path temp_architecture.md -Destination docs\ARCHITECTURE.md -Force
Move-Item -Path temp_current_sprint.md -Destination docs\CURRENT_SPRINT.md -Force
Move-Item -Path temp_agent_protocols.md -Destination docs\AGENT_PROTOCOLS.md -Force
Move-Item -Path temp_decisions_log.md -Destination docs\DECISIONS_LOG.md -Force

if (Test-Path docs\agent\modules) { Remove-Item docs\agent\modules -Recurse -Force }
if (Test-Path docs\agent) { Remove-Item docs\agent -Recurse -Force }
