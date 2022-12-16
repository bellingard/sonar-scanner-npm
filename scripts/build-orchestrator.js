const { execSync } = require('child_process');
const path = require('path');

execSync('npm run build', {
  cwd: path.join(__dirname, '..', 'tools', 'orchestrator'),
  stdio: 'inherit'
})

