import { createHash } from 'node:crypto'

// ==================== Mobile App User Agent Configuration ====================
/**
 * Custom User Agent format for BagusPay Mobile App:
 * BagusPay/<version> (<platform>; <os_version>; <device_model>)
 *
 * Examples:
 * - Android: BagusPay/1.0.0 (Android; 13; Samsung Galaxy S21)
 * - iOS: BagusPay/1.0.0 (iOS; 17.0; iPhone 15 Pro)
 *
 * Usage in mobile app:
 * - Android (Kotlin): "BagusPay/${BuildConfig.VERSION_NAME} (Android; ${Build.VERSION.RELEASE}; ${Build.MODEL})"
 * - iOS (Swift): "BagusPay/\(appVersion) (iOS; \(UIDevice.current.systemVersion); \(UIDevice.current.model))"
 * - React Native: `BagusPay/${version} (${Platform.OS}; ${Platform.Version}; ${DeviceInfo.getModel()})`
 * - Flutter: 'BagusPay/$version (${Platform.operatingSystem}; ${Platform.operatingSystemVersion}; $deviceModel)'
 */
export const BAGUSPAY_APP_USER_AGENT_PREFIX = 'BagusPay/'
export const BAGUSPAY_APP_USER_AGENT_REGEX =
  /^BagusPay\/(\d+\.\d+\.\d+)\s*\(([^;]+);\s*([^;]+);\s*([^)]+)\)/i

export interface MobileAppInfo {
  isBagusPayApp: boolean
  appVersion: string
  platform: 'Android' | 'iOS' | 'Unknown'
  osVersion: string
  deviceModel: string
}

/**
 * Parse BagusPay mobile app user agent
 */
export function parseBagusPayAppUserAgent(userAgent: string): MobileAppInfo {
  const match = userAgent.match(BAGUSPAY_APP_USER_AGENT_REGEX)

  if (!match) {
    return {
      isBagusPayApp: false,
      appVersion: '',
      platform: 'Unknown',
      osVersion: '',
      deviceModel: '',
    }
  }

  const [, appVersion, platform, osVersion, deviceModel] = match

  return {
    isBagusPayApp: true,
    appVersion: appVersion || '',
    platform:
      platform?.toLowerCase() === 'android'
        ? 'Android'
        : platform?.toLowerCase() === 'ios'
          ? 'iOS'
          : 'Unknown',
    osVersion: osVersion?.trim() || '',
    deviceModel: deviceModel?.trim() || '',
  }
}

/**
 * Check if user agent is from BagusPay mobile app
 */
export function isBagusPayMobileApp(userAgent: string): boolean {
  return userAgent.startsWith(BAGUSPAY_APP_USER_AGENT_PREFIX)
}

/**
 * Generate user agent string for BagusPay mobile app
 * Use this function as reference for mobile app imp89lementation
 */
export function generateBagusPayAppUserAgent(
  version: string,
  platform: 'Android' | 'iOS',
  osVersion: string,
  deviceModel: string,
): string {
  return `BagusPay/${version} (${platform}; ${osVersion}; ${deviceModel})`
}

// ==================== Device Info Types ====================

export interface DeviceInfo {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  fingerprint: string
  isBagusPayApp: boolean
  appInfo?: MobileAppInfo
}

export interface ParsedUserAgent {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  isMobile: boolean
  isTablet: boolean
  isBagusPayApp: boolean
  appInfo?: MobileAppInfo
}

/**
 * Parse user agent string to extract browser, OS, and device information
 */
export function parseUserAgent(userAgent: string): ParsedUserAgent {
  // Check if it's BagusPay mobile app first
  const bagusPayAppInfo = parseBagusPayAppUserAgent(userAgent)

  if (bagusPayAppInfo.isBagusPayApp) {
    return {
      browser: 'BagusPay App',
      browserVersion: bagusPayAppInfo.appVersion,
      os: bagusPayAppInfo.platform,
      osVersion: bagusPayAppInfo.osVersion,
      isMobile: true,
      isTablet: false,
      isBagusPayApp: true,
      appInfo: bagusPayAppInfo,
    }
  }

  const ua = userAgent.toLowerCase()

  // Detect Browser
  let browser = 'Unknown'
  let browserVersion = ''

  if (ua.includes('edg/')) {
    browser = 'Edge'
    browserVersion = extractVersion(userAgent, /edg\/(\d+(\.\d+)?)/i)
  } else if (ua.includes('opr/') || ua.includes('opera')) {
    browser = 'Opera'
    browserVersion = extractVersion(userAgent, /(?:opr|opera)\/(\d+(\.\d+)?)/i)
  } else if (ua.includes('chrome') && !ua.includes('chromium')) {
    browser = 'Chrome'
    browserVersion = extractVersion(userAgent, /chrome\/(\d+(\.\d+)?)/i)
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari'
    browserVersion = extractVersion(userAgent, /version\/(\d+(\.\d+)?)/i)
  } else if (ua.includes('firefox')) {
    browser = 'Firefox'
    browserVersion = extractVersion(userAgent, /firefox\/(\d+(\.\d+)?)/i)
  } else if (ua.includes('msie') || ua.includes('trident')) {
    browser = 'IE'
    browserVersion = extractVersion(userAgent, /(?:msie |rv:)(\d+(\.\d+)?)/i)
  }

  // Detect OS
  let os = 'Unknown'
  let osVersion = ''

  if (ua.includes('windows')) {
    os = 'Windows'
    osVersion = extractWindowsVersion(userAgent)
  } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
    os = 'macOS'
    osVersion = extractVersion(userAgent, /mac os x (\d+[._]\d+([._]\d+)?)/i).replace(/_/g, '.')
  } else if (ua.includes('android')) {
    os = 'Android'
    osVersion = extractVersion(userAgent, /android (\d+(\.\d+)?)/i)
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS'
    osVersion = extractVersion(userAgent, /os (\d+[._]\d+([._]\d+)?)/i).replace(/_/g, '.')
  } else if (ua.includes('linux')) {
    os = 'Linux'
    osVersion = ''
  }

  // Detect Device Type
  const isMobile = /mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(userAgent)
  const isTablet = /tablet|ipad|android(?!.*mobile)/i.test(userAgent)

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    isMobile,
    isTablet,
    isBagusPayApp: false,
  }
}

/**
 * Extract version number from user agent using regex
 */
function extractVersion(userAgent: string, regex: RegExp): string {
  const match = userAgent.match(regex)
  return match ? match[1] : ''
}

/**
 * Extract Windows version from user agent
 */
function extractWindowsVersion(userAgent: string): string {
  const windowsVersions: Record<string, string> = {
    '10.0': '10/11',
    '6.3': '8.1',
    '6.2': '8',
    '6.1': '7',
    '6.0': 'Vista',
    '5.1': 'XP',
  }

  const match = userAgent.match(/windows nt (\d+\.\d+)/i)
  if (match) {
    return windowsVersions[match[1]] || match[1]
  }
  return ''
}

/**
 * Generate device fingerprint from device ID, user agent, and optional additional data
 * This creates a stable identifier for the same device
 */
export function generateDeviceFingerprint(
  deviceId: string,
  userAgent: string,
  additionalData?: string,
): string {
  const parsed = parseUserAgent(userAgent)

  // Create fingerprint from stable device characteristics
  // We use browser + OS (without versions) to allow for updates
  const fingerprintData = [
    deviceId,
    parsed.browser,
    parsed.os,
    parsed.isMobile ? 'mobile' : parsed.isTablet ? 'tablet' : 'desktop',
    additionalData || '',
  ].join('|')

  return createHash('sha256').update(fingerprintData).digest('hex').substring(0, 32)
}

/**
 * Get complete device info from user agent and device ID
 */
export function getDeviceInfo(deviceId: string, userAgent: string): DeviceInfo {
  const parsed = parseUserAgent(userAgent)

  // For BagusPay app, include app info and use device model in fingerprint
  if (parsed.isBagusPayApp && parsed.appInfo) {
    const fingerprint = generateDeviceFingerprint(deviceId, userAgent, parsed.appInfo.deviceModel)

    return {
      browser: 'BagusPay App',
      browserVersion: parsed.appInfo.appVersion,
      os: parsed.appInfo.platform,
      osVersion: parsed.appInfo.osVersion,
      deviceType: 'mobile',
      fingerprint,
      isBagusPayApp: true,
      appInfo: parsed.appInfo,
    }
  }

  return {
    browser: parsed.browser,
    browserVersion: parsed.browserVersion,
    os: parsed.os,
    osVersion: parsed.osVersion,
    deviceType: parsed.isMobile ? 'mobile' : parsed.isTablet ? 'tablet' : 'desktop',
    fingerprint: generateDeviceFingerprint(deviceId, userAgent),
    isBagusPayApp: false,
  }
}

/**
 * Check if two devices are likely the same based on fingerprint and characteristics
 * Returns a confidence score from 0 to 1
 */
export function calculateDeviceSimilarity(
  device1: { deviceId: string; userAgent: string; ip?: string },
  device2: { deviceId: string; userAgent: string; ip?: string },
): number {
  let score = 0
  const weights = {
    deviceId: 0.4,
    fingerprint: 0.3,
    browser: 0.1,
    os: 0.15,
    ip: 0.05,
  }

  // Device ID match
  if (device1.deviceId === device2.deviceId) {
    score += weights.deviceId
  }

  // Fingerprint match
  const fp1 = generateDeviceFingerprint(device1.deviceId, device1.userAgent)
  const fp2 = generateDeviceFingerprint(device2.deviceId, device2.userAgent)
  if (fp1 === fp2) {
    score += weights.fingerprint
  }

  // Parse user agents
  const parsed1 = parseUserAgent(device1.userAgent)
  const parsed2 = parseUserAgent(device2.userAgent)

  // Browser match
  if (parsed1.browser === parsed2.browser) {
    score += weights.browser
  }

  // OS match
  if (parsed1.os === parsed2.os) {
    score += weights.os
  }

  // IP match (optional, less weight as IP can change)
  if (device1.ip && device2.ip && device1.ip === device2.ip) {
    score += weights.ip
  }

  return score
}

/**
 * Determine if login is from same device
 * Uses fingerprint as primary check with fallback to similarity scoring
 */
export function isSameDevice(
  newDevice: { deviceId: string; userAgent: string; ip?: string },
  existingDevice: { deviceId: string; userAgent: string; ip?: string },
  threshold = 0.7,
): boolean {
  // Primary check: fingerprint match
  const newFingerprint = generateDeviceFingerprint(newDevice.deviceId, newDevice.userAgent)
  const existingFingerprint = generateDeviceFingerprint(
    existingDevice.deviceId,
    existingDevice.userAgent,
  )

  if (newFingerprint === existingFingerprint) {
    return true
  }

  // Secondary check: similarity scoring
  const similarity = calculateDeviceSimilarity(newDevice, existingDevice)
  return similarity >= threshold
}
