/**
 * GitHub Plugin Loader
 *
 * Inspired by lazy.nvim, this loader can fetch and cache plugins from GitHub repositories.
 * Supports both direct file URLs and repository-based plugin discovery.
 */

import type { PluginConfig } from "./loader";

/**
 * GitHub Plugin Config
 *
 * @param url - GitHub repository in format "owner/repo" or direct raw URL
 * @param branch - Git branch/tag to use (defaults to 'main')
 * @param entryPoint - Path to plugin file within repo (defaults to 'plugin.js' or 'index.js')
 * @param lazy - Enable lazy loading (load only when needed)
 *
 * @since 0.1.0
 */
export interface GitHubPluginConfig extends PluginConfig {
  url: string;
  branch?: string;
  entryPoint?: string;
  lazy?: boolean;
  dependencies?: string[];
  version?: string;
  cache?: {
    enabled: boolean;
    ttl?: number; // Time to live in milliseconds
  };
}

/**
 * Plugin Manifest
 *
 * @since 0.1.0
 */
export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  main: string; // Entry point file
  dependencies?: string[];
  permissions?: string[];
  api?: {
    version: string;
    required?: string[];
  };
}

/**
 * GitHub Plugin Loader
 *
 * Inspired by lazy.nvim, this loader can fetch and cache plugins from GitHub repositories.
 *
 * @author @jarenm1
 * @since 0.1.0
 */
class GitHubPluginLoader {
  private cache = new Map<
    string,
    { content: string; timestamp: number; etag?: string }
  >();
  private loadedPlugins = new Set<string>();
  private loadingPromises = new Map<string, Promise<string>>();

  /**
   * Parse GitHub URL into components
   *
   * @param url - The GitHub URL to parse
   * @returns The parsed URL components
   *
   * @since 0.1.0
   */
  private parseGitHubUrl(url: string): {
    owner: string;
    repo: string;
    branch: string;
    path: string;
  } | null {
    // Handle direct raw.githubusercontent.com URLs
    const rawMatch = url.match(
      /https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)/,
    );
    if (rawMatch) {
      return {
        owner: rawMatch[1],
        repo: rawMatch[2],
        branch: rawMatch[3],
        path: rawMatch[4],
      };
    }

    // Handle "owner/repo" format
    const shortMatch = url.match(/^([^/]+)\/([^/]+)$/);
    if (shortMatch) {
      return {
        owner: shortMatch[1],
        repo: shortMatch[2],
        branch: "main",
        path: "index.js", // Default entry point
      };
    }

    return null;
  }

  /**
   * Construct raw GitHub URL for file access
   */
  private getRawUrl(
    owner: string,
    repo: string,
    branch: string,
    path: string,
  ): string {
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  }

  /**
   * Check if plugin is cached and valid
   */
  private getCachedPlugin(
    url: string,
    ttl: number = 24 * 60 * 60 * 1000,
  ): string | null {
    const cached = this.cache.get(url);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > ttl;
    if (isExpired) {
      this.cache.delete(url);
      return null;
    }

    return cached.content;
  }

  /**
   * Fetch plugin manifest (plugin.json or package.json)
   */
  private async fetchManifest(
    owner: string,
    repo: string,
    branch: string,
  ): Promise<PluginManifest | null> {
    const manifestPaths = ["plugin.json", "package.json", "manifest.json"];

    for (const manifestPath of manifestPaths) {
      try {
        const url = this.getRawUrl(owner, repo, branch, manifestPath);
        const response = await fetch(url);

        if (response.ok) {
          const manifest = await response.json();

          // Adapt package.json to PluginManifest format if needed
          if (manifestPath === "package.json") {
            return {
              name: manifest.name,
              version: manifest.version,
              description: manifest.description,
              author: manifest.author,
              main: manifest.main || "plugin.js",
              dependencies:
                manifest.jeditrDependencies || manifest.peerDependencies,
              permissions: manifest.jeditrPermissions,
              api: manifest.jeditrApi,
            };
          }

          return manifest;
        }
      } catch (error) {
      }
    }

    return null;
  }

  /**
   * Fetch plugin code from GitHub with caching
   */
  private async fetchPluginCode(
    url: string,
    useCache: boolean = true,
  ): Promise<string> {
    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Check cache first
    if (useCache) {
      const cached = this.getCachedPlugin(url);
      if (cached) return cached;
    }

    // Create loading promise
    const loadingPromise = this.doFetchPluginCode(url);
    this.loadingPromises.set(url, loadingPromise);

    try {
      const content = await loadingPromise;
      this.loadingPromises.delete(url);
      return content;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  private async doFetchPluginCode(url: string): Promise<string> {
    const parsed = this.parseGitHubUrl(url);
    if (!parsed) {
      // Try as direct URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch plugin from ${url}: ${response.statusText}`,
        );
      }
      return response.text();
    }

    const { owner, repo, branch, path } = parsed;

    // Try to fetch manifest first for better error handling
    const manifest = await this.fetchManifest(owner, repo, branch);
    const entryPoint = manifest?.main || path;

    const pluginUrl = this.getRawUrl(owner, repo, branch, entryPoint);
    const response = await fetch(pluginUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch plugin ${owner}/${repo}@${branch}:${entryPoint}: ${response.statusText}`,
      );
    }

    const content = await response.text();

    // Cache the result
    this.cache.set(url, {
      content,
      timestamp: Date.now(),
      etag: response.headers.get("etag") || undefined,
    });

    return content;
  }

  /**
   * Load plugin from GitHub URL
   */
  async loadGitHubPlugin(config: GitHubPluginConfig): Promise<Worker> {
    try {
      // Check if already loaded
      if (this.loadedPlugins.has(config.url)) {
        console.warn(`Plugin ${config.name} already loaded from ${config.url}`);
        throw new Error(
          `Plugin ${config.name} already loaded from ${config.url}`,
        );
      }

      // Load dependencies first
      if (config.dependencies?.length) {
        await this.loadDependencies(config.dependencies);
      }

      // Fetch plugin code
      const cacheEnabled = config.cache?.enabled ?? true;
      const pluginCode = await this.fetchPluginCode(config.url, cacheEnabled);

      // Create blob URL for the worker
      const blob = new Blob([pluginCode], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);

      // Create and configure worker
      const worker = new Worker(workerUrl, { type: "module" });

      // Clean up blob URL after worker creation
      URL.revokeObjectURL(workerUrl);

      // Mark as loaded
      this.loadedPlugins.add(config.url);

      console.log(`Loaded plugin: ${config.name} from ${config.url}`);
      return worker;
    } catch (error) {
      console.error(`Failed to load plugin ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * Load plugin dependencies
   */
  private async loadDependencies(dependencies: string[]): Promise<void> {
    for (const dep of dependencies) {
      if (!this.loadedPlugins.has(dep)) {
        // Recursively load dependency
        await this.loadGitHubPlugin({
          name: `dependency-${dep}`,
          url: dep,
        });
      }
    }
  }

  /**
   * Install plugin (fetch and validate but don't load)
   */
  async installPlugin(
    config: GitHubPluginConfig,
  ): Promise<PluginManifest | null> {
    const parsed = this.parseGitHubUrl(config.url);
    if (!parsed) return null;

    const { owner, repo, branch } = parsed;
    return this.fetchManifest(owner, repo, branch);
  }

  /**
   * Clear plugin cache
   */
  clearCache(url?: string): void {
    if (url) {
      this.cache.delete(url);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ url: string; timestamp: number; size: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([url, data]) => ({
      url,
      timestamp: data.timestamp,
      size: data.content.length,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }
}

export const githubPluginLoader = new GitHubPluginLoader();
