const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const __dirname_cjs = __dirname;

const groups = {
  'PROJECT_CONTEXT.md': [
    'docs/PROJECT_MASTER_SUMMARY.md',
    'docs/ROADMAP.md',
    'docs/PROJECT_STATUS.md',
    'docs/agent/PROJECT_CONTEXT.md'
  ],
  'ARCHITECTURE.md': [
    'docs/agent/MODULE_MAP.md',
    'docs/agent/TEST_STRATEGY.md',
    'docs/agent/INVESTIGATION_MAPPING.md',
    'docs/agent/QUESTION_MAPPING.md',
    'docs/agent/modules/ADM.md',
    'docs/agent/modules/ANL.md',
    'docs/agent/modules/BE.md',
    'docs/agent/modules/GAME.md',
    'docs/agent/modules/LRN-EXCEL.md',
    'docs/agent/modules/LRN-SQL.md',
    'docs/agent/modules/LRN-SUB.md',
    'docs/agent/modules/SHR.md'
  ],
  'CURRENT_SPRINT.md': [
    'docs/BACKLOG.md',
    'docs/CHECKLIST.md',
    'docs/agent/CURRENT_TASK.md'
  ],
  'AGENT_PROTOCOLS.md': [
    'AGENTS.md',
    'docs/agent/CONTRACTS.md',
    'docs/agent/LEARNING_MAP_CONTRACT.md',
    'docs/agent/MASTERY_CONTRACT.md',
    'docs/agent/PROGRESS_CONTRACT.md',
    'docs/agent/REWARD_CONTRACT.md',
    'docs/agent/SUBMISSION_BINDING.md'
  ],
  'DECISIONS_LOG.md': [
    'docs/DECISIONS.md',
    'docs/agent/DECISIONS.md',
    'docs/agent/UI_CHANGE_INVENTORY.md'
  ]
};

try {
    for (const [targetName, files] of Object.entries(groups)) {
      let content = '';
      for (const f of files) {
        const fullPath = path.join(__dirname_cjs, f);
        if (fs.existsSync(fullPath)) {
          content += `\n\n--- Content of ${f} ---\n\n`;
          content += fs.readFileSync(fullPath, 'utf-8');
          // delete old file
          try {
            fs.unlinkSync(fullPath);
          } catch(e) {}
        }
      }
      const targetPath = path.join(__dirname_cjs, 'docs', targetName);
      fs.writeFileSync(targetPath, content, 'utf-8');
      console.log(`Created ${targetName}`);
    }

    // Cleanup dirs safely
    const rmdirRecursive = (dir) => {
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach((file) => {
                const curPath = path.join(dir, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    rmdirRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            try { fs.rmdirSync(dir); } catch(e){}
        }
    };

    rmdirRecursive(path.join(__dirname_cjs, 'docs/agent/modules'));
    const agentDir = path.join(__dirname_cjs, 'docs/agent');
    if (fs.existsSync(agentDir) && fs.readdirSync(agentDir).length === 0) {
       try { fs.rmdirSync(agentDir); } catch(e){}
    }
    
    // delete temp files if they exist
    const temps = fs.readdirSync(__dirname_cjs).filter(x => x.startsWith('temp_') && x.endsWith('.md'));
    for(const t of temps) {
        fs.unlinkSync(path.join(__dirname_cjs, t));
    }
    
    console.log("Docs refactored successfully.");
} catch(e) {
    console.error(e);
}
