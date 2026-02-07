export interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl?: string;
  assetName?: string;
  releaseDate?: string;
}

const GITHUB_API_URL = 'https://api.github.com/repos/kurisu-agent/tzone-buddy/releases/latest';
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get the platform-specific asset name for downloads
 */
function getAssetName(): string {
  const plat = process.platform;
  const archName = process.arch;

  if (plat === 'linux') {
    return archName === 'arm64' ? 'tzone-buddy-linux-arm64' : 'tzone-buddy-linux-x64';
  } else if (plat === 'darwin') {
    return archName === 'arm64' ? 'tzone-buddy-darwin-arm64' : 'tzone-buddy-darwin-x64';
  }

  throw new Error(`Unsupported platform: ${plat} ${archName}`);
}

/**
 * Compare semantic versions (v1.2.3 format)
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const clean = (v: string) => v.replace(/^v/, '');
  const parts1 = clean(v1).split('.').map(Number);
  const parts2 = clean(v2).split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

/**
 * Check if an update check is needed based on last check time
 */
export function shouldCheckForUpdate(lastCheck?: number): boolean {
  if (!lastCheck) return true;
  return Date.now() - lastCheck > UPDATE_CHECK_INTERVAL;
}

/**
 * Fetch the latest release information from GitHub
 */
export async function fetchLatestRelease(): Promise<Release | null> {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'tzone-buddy'
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json() as Release;
  } catch (error) {
    // Silently fail - we don't want to interrupt the user experience
    return null;
  }
}

/**
 * Check for updates by comparing current version with latest release
 */
export async function checkForUpdate(currentVersion: string): Promise<UpdateInfo> {
  const latest = await fetchLatestRelease();

  if (!latest) {
    return {
      available: false,
      currentVersion,
      latestVersion: currentVersion
    };
  }

  const latestVersion = latest.tag_name.startsWith('v')
    ? latest.tag_name.substring(1)
    : latest.tag_name;

  const isNewer = compareVersions(latestVersion, currentVersion) > 0;

  if (!isNewer) {
    return {
      available: false,
      currentVersion,
      latestVersion
    };
  }

  const assetName = getAssetName();
  const asset = latest.assets.find(a => a.name === assetName);

  if (!asset) {
    return {
      available: false,
      currentVersion,
      latestVersion
    };
  }

  return {
    available: true,
    currentVersion,
    latestVersion,
    downloadUrl: asset.browser_download_url,
    assetName: asset.name,
    releaseDate: latest.published_at
  };
}

/**
 * Download and apply an update using Bun's shell
 */
export async function applyUpdate(updateInfo: UpdateInfo): Promise<void> {
  if (!updateInfo.available || !updateInfo.downloadUrl) {
    throw new Error('No update available');
  }

  // Use Bun's shell to download and replace the binary
  const tempFile = `/tmp/tzone-buddy-update-${Date.now()}`;
  const currentPath = process.execPath;

  try {
    // Download the new binary
    const downloadCmd = `curl -fsSL "${updateInfo.downloadUrl}" -o "${tempFile}" && chmod +x "${tempFile}"`;
    const proc = Bun.spawn(["sh", "-c", downloadCmd], {
      stdout: "inherit",
      stderr: "inherit"
    });

    await proc.exited;

    if (proc.exitCode !== 0) {
      throw new Error('Download failed');
    }

    // Create an update script that will replace the binary after we exit
    const updateScript = `#!/bin/sh
sleep 0.5
mv -f "${tempFile}" "${currentPath}" 2>/dev/null || sudo mv -f "${tempFile}" "${currentPath}"
chmod +x "${currentPath}" 2>/dev/null || sudo chmod +x "${currentPath}"
exec "${currentPath}" "$@"
`;

    const scriptPath = `/tmp/update-tzone-buddy-${Date.now()}.sh`;
    await Bun.write(scriptPath, updateScript);

    // Make the script executable
    const chmodProc = Bun.spawn(["chmod", "+x", scriptPath]);
    await chmodProc.exited;

    // Execute the update script in the background and exit
    Bun.spawn([scriptPath, ...process.argv.slice(2)], {
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit"
    });

    // Exit the current process
    process.exit(0);
  } catch (error) {
    // Clean up temp file on error
    try {
      await Bun.spawn(["rm", "-f", tempFile]).exited;
    } catch {}

    throw error;
  }
}