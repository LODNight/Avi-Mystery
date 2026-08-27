const fs = require('fs');
const path = require('path');

const oldFiles = [
    "AGENTS.md",
    "docs/BACKLOG.md",
    "docs/CHECKLIST.md",
    "docs/DECISIONS.md",
    "docs/PROJECT_MASTER_SUMMARY.md",
    "docs/PROJECT_STATUS.md",
    "docs/ROADMAP.md",
    "docs/agent/CONTRACTS.md",
    "docs/agent/CURRENT_TASK.md",
    "docs/agent/DECISIONS.md",
    "docs/agent/INVESTIGATION_MAPPING.md",
    "docs/agent/LEARNING_MAP_CONTRACT.md",
    "docs/agent/MASTERY_CONTRACT.md",
    "docs/agent/MODULE_MAP.md",
    "docs/agent/PROGRESS_CONTRACT.md",
    "docs/agent/PROJECT_CONTEXT.md",
    "docs/agent/QUESTION_MAPPING.md",
    "docs/agent/REWARD_CONTRACT.md",
    "docs/agent/SUBMISSION_BINDING.md",
    "docs/agent/TEST_STRATEGY.md",
    "docs/agent/UI_CHANGE_INVENTORY.md",
    "docs/agent/modules/ADM.md",
    "docs/agent/modules/ANL.md",
    "docs/agent/modules/BE.md",
    "docs/agent/modules/GAME.md",
    "docs/agent/modules/LRN-EXCEL.md",
    "docs/agent/modules/LRN-SQL.md",
    "docs/agent/modules/LRN-SUB.md",
    "docs/agent/modules/SHR.md"
];

for (const f of oldFiles) {
    const fullPath = path.join(__dirname, f);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}

fs.renameSync(path.join(__dirname, 'temp_project_context.md'), path.join(__dirname, 'docs/PROJECT_CONTEXT.md'));
fs.renameSync(path.join(__dirname, 'temp_architecture.md'), path.join(__dirname, 'docs/ARCHITECTURE.md'));
fs.renameSync(path.join(__dirname, 'temp_current_sprint.md'), path.join(__dirname, 'docs/CURRENT_SPRINT.md'));
fs.renameSync(path.join(__dirname, 'temp_agent_protocols.md'), path.join(__dirname, 'docs/AGENT_PROTOCOLS.md'));
fs.renameSync(path.join(__dirname, 'temp_decisions_log.md'), path.join(__dirname, 'docs/DECISIONS_LOG.md'));

const rmdirRecursive = (dir) => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file, index) => {
            const curPath = path.join(dir, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                rmdirRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dir);
    }
};

rmdirRecursive(path.join(__dirname, 'docs/agent'));
console.log("Cleanup completed.");
