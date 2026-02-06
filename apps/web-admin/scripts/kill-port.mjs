import { execSync } from 'node:child_process'

const PORTS = [3333, 24679]

for (const port of PORTS) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' })
    const lines = output.trim().split('\n')

    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      const pid = parts[parts.length - 1]

      if (pid && pid !== '0') {
        try {
          execSync(`powershell "Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue"`)
          console.log(`Killed process ${pid} on port ${port}`)
        } catch {
          // Process may have already exited
        }
      }
    }
  } catch {
    // Port not in use, which is fine
  }
}

console.log('Port cleanup complete')
