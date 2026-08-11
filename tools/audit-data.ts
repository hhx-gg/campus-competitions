import { competitions } from '../src/data/allCompetitions'
import { sourceRegistry } from '../src/data/sourceRegistry'
import { auditCompetitionData } from '../src/lib/dataQuality'

const report = auditCompetitionData(competitions, sourceRegistry)
console.log(JSON.stringify(report, null, 2))
if (!report.publishable) process.exitCode = 1
