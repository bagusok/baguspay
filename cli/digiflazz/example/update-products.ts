import * as fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { digiflazzTools } from '../src'
import type { Cookie } from '../src/digiflazz.type'
import { syncConfig } from './update-products.config'

const ansi = {
  red: (value: string) => `\u001b[31m${value}\u001b[0m`,
  green: (value: string) => `\u001b[32m${value}\u001b[0m`,
  yellow: (value: string) => `\u001b[33m${value}\u001b[0m`,
  cyan: (value: string) => `\u001b[36m${value}\u001b[0m`,
  gray: (value: string) => `\u001b[90m${value}\u001b[0m`,
}

const log = {
  info: (message: string) => console.log(`${ansi.cyan('[info]')} ${message}`),
  warn: (message: string) => console.log(`${ansi.yellow('[warn]')} ${message}`),
  error: (message: string) => console.log(`${ansi.red('[error]')} ${message}`),
  success: (message: string) => console.log(`${ansi.green('[ok]')} ${message}`),
  muted: (message: string) => console.log(`${ansi.gray('[...]')} ${message}`),
}

const getCookies = async (cookiesPath: string) => {
  const cookiesRaw = await fs.readFile(cookiesPath, 'utf-8')
  return JSON.parse(cookiesRaw) as Cookie[]
}

const toSafeFilename = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')

const main = async () => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const cookiesPath = path.join(__dirname, syncConfig.cookiesPath)
  const reportsPath = syncConfig.report.enabled
    ? path.isAbsolute(syncConfig.report.path)
      ? syncConfig.report.path
      : path.join(__dirname, syncConfig.report.path)
    : ''

  log.info(`Loading cookies from ${cookiesPath}`)
  log.info(`Category selector: ${syncConfig.categories.join(', ')}`)
  log.info(`Subcategory/Brand selector: ${syncConfig.subCategoryTypeIds.join(', ')}`)
  if (syncConfig.report.enabled) {
    if (!syncConfig.report.path) {
      throw new Error('report.path must be set when report.enabled is true')
    }
    await fs.mkdir(reportsPath, { recursive: true })
  }

  const cookies = await getCookies(cookiesPath)
  const reports = await digiflazzTools.update({
    cookies,
    categories: syncConfig.categories,
    subCategoryTypeIds: syncConfig.subCategoryTypeIds,
    excludeProductCodes: syncConfig.excludeProductCodes,
    updateMode: syncConfig.updateMode,
    perProduct: syncConfig.perProduct,
    autoFillProductCode: syncConfig.autoFillProductCode,
    maxPrice: syncConfig.maxPrice,
    onlyProblematic: syncConfig.onlyProblematic,
    problematicCriteria: syncConfig.problematicCriteria,
    sellerFilter: syncConfig.sellerFilter,
    requestDelayMs: 1000,
    logger: log,
  })

  if (reports.length === 0) {
    log.warn('No report generated.')
    return
  }

  if (!syncConfig.report.enabled) {
    return
  }

  for (const report of reports) {
    const reportFile = path.join(
      reportsPath,
      `${toSafeFilename(report.categoryName)}-${report.categoryId}-${toSafeFilename(
        report.brandName,
      )}-${report.brandId}.json`,
    )
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2))
    log.muted(`Report saved: ${reportFile}`)

    if (report.failedSample?.length) {
      const failureFile = path.join(
        reportsPath,
        `failed-update-${toSafeFilename(report.categoryName)}-${report.categoryId}-${toSafeFilename(
          report.brandName,
        )}-${report.brandId}.json`,
      )
      await fs.writeFile(failureFile, JSON.stringify(report, null, 2))
      log.muted(`Failure report saved: ${failureFile}`)
    }
  }
}

main().catch((error: Error) => {
  log.error(error.message)
})
