/**
 * Example Agent Plugin - Terminal Reader
 *
 * This demonstrates how an AI agent can use the terminal API to:
 * - Execute commands and read output
 * - Monitor build processes
 * - Analyze command results
 * - Interact with CLI tools programmatically
 */

// In a real plugin, you'd receive the API via postMessage
// This example shows the API usage patterns

class AgentTerminalExample {
  constructor(api) {
    this.api = api;
    this.sessionId = null;
  }

  /**
   * Initialize a terminal session for the agent
   */
  async initializeSession() {
    try {
      // Create a new terminal session
      const session = await this.api.terminal.createTerminalSession({
        workingDirectory: "/path/to/project",
      });

      this.sessionId = session.sessionId;
      console.log(`Agent initialized terminal session: ${this.sessionId}`);

      return session;
    } catch (error) {
      console.error("Failed to initialize terminal session:", error);
      throw error;
    }
  }

  /**
   * Run a command and analyze the output
   */
  async runAndAnalyzeCommand(command) {
    if (!this.sessionId) {
      await this.initializeSession();
    }

    try {
      console.log(`Executing: ${command}`);

      // Execute the command and wait for completion
      const result = await this.api.terminal.executeCommand(
        this.sessionId,
        command,
        {
          timeoutMs: 30000,
          captureOutput: true,
        },
      );

      // Analyze the output
      const analysis = this.analyzeOutput(result);

      return {
        command,
        result,
        analysis,
      };
    } catch (error) {
      console.error(`Command failed: ${command}`, error);
      return {
        command,
        error: error.toString(),
        analysis: { success: false, errors: [error.toString()] },
      };
    }
  }

  /**
   * Monitor a long-running process (like builds, tests, etc.)
   */
  async monitorProcess(command, progressCallback) {
    if (!this.sessionId) {
      await this.initializeSession();
    }

    try {
      // Start the command without waiting for completion
      await this.api.terminal.executeCommand(this.sessionId, command, {
        waitForCompletion: false,
      });

      // Monitor output in real-time
      let lastLineNumber = 0;
      const pollInterval = 1000; // Check every second

      const monitor = setInterval(async () => {
        try {
          // Read only new output
          const newOutput = await this.api.terminal.readTerminalOutput(
            this.sessionId,
            {
              startLine: lastLineNumber,
              onlyNew: true,
            },
          );

          if (newOutput.length > 0) {
            // Update progress
            lastLineNumber =
              Math.max(...newOutput.map((o) => o.lineNumber)) + 1;

            // Analyze new output for completion or errors
            const analysis = this.analyzeOutput({ output: newOutput });

            // Call progress callback
            if (progressCallback) {
              progressCallback({
                newOutput,
                analysis,
                isComplete: analysis.isComplete || analysis.hasFailed,
              });
            }

            // Stop monitoring if process is complete
            if (analysis.isComplete || analysis.hasFailed) {
              clearInterval(monitor);
            }
          }

          // Check if command is still running
          const isRunning = await this.api.terminal.isCommandRunning(
            this.sessionId,
          );
          if (!isRunning) {
            clearInterval(monitor);
            progressCallback?.({ isComplete: true });
          }
        } catch (error) {
          console.error("Monitor error:", error);
          clearInterval(monitor);
        }
      }, pollInterval);
    } catch (error) {
      console.error("Failed to start monitoring:", error);
      throw error;
    }
  }

  /**
   * Analyze command output for success/failure patterns
   */
  analyzeOutput(result) {
    const output = result.output || [];
    const allText = output
      .map((o) => o.content)
      .join("\n")
      .toLowerCase();

    // Pattern matching for common scenarios
    const patterns = {
      success: [
        /build\s+successful/,
        /compilation\s+complete/,
        /tests?\s+passed/,
        /installation\s+complete/,
        /done/,
      ],
      errors: [
        /error[:;]/,
        /failed/,
        /compilation\s+failed/,
        /tests?\s+failed/,
        /cannot\s+find/,
        /permission\s+denied/,
      ],
      warnings: [/warning[:;]/, /deprecated/, /caution/],
    };

    const analysis = {
      success: patterns.success.some((p) => p.test(allText)),
      hasErrors: patterns.errors.some((p) => p.test(allText)),
      hasWarnings: patterns.warnings.some((p) => p.test(allText)),
      isComplete: false,
      hasFailed: false,
      errors: [],
      warnings: [],
    };

    // Extract specific error and warning lines
    output.forEach((line) => {
      const content = line.content.toLowerCase();
      if (patterns.errors.some((p) => p.test(content))) {
        analysis.errors.push(line.content);
      }
      if (patterns.warnings.some((p) => p.test(content))) {
        analysis.warnings.push(line.content);
      }
    });

    // Determine completion status
    analysis.isComplete = analysis.success || result.exitStatus === 0;
    analysis.hasFailed =
      analysis.hasErrors ||
      (result.exitStatus !== undefined && result.exitStatus !== 0);

    return analysis;
  }

  /**
   * Example: Build project and analyze results
   */
  async buildProject() {
    console.log("🔨 Starting project build...");

    const buildResult = await this.runAndAnalyzeCommand("npm run build");

    if (buildResult.analysis.success) {
      console.log("✅ Build successful!");

      // Show success notification
      this.api.showNotification(
        "Agent",
        "Build completed successfully!",
        "info",
      );
    } else {
      console.log("❌ Build failed!");
      console.log("Errors:", buildResult.analysis.errors);

      // Show error notification with details
      this.api.showNotification(
        "Agent",
        `Build failed: ${buildResult.analysis.errors.join(", ")}`,
        "error",
      );
    }

    return buildResult;
  }

  /**
   * Example: Run tests and monitor progress
   */
  async runTests() {
    console.log("🧪 Running tests...");

    await this.monitorProcess("npm test", (progress) => {
      if (progress.newOutput) {
        console.log(
          "New test output:",
          progress.newOutput.map((o) => o.content),
        );
      }

      if (progress.isComplete) {
        console.log("✅ Tests completed!");
        this.api.showNotification("Agent", "Tests completed!", "info");
      }
    });
  }

  /**
   * Cleanup terminal session
   */
  async cleanup() {
    if (this.sessionId) {
      try {
        await this.api.terminal.terminateTerminalSession(this.sessionId);
        console.log("Terminal session cleaned up");
      } catch (error) {
        console.error("Failed to cleanup session:", error);
      }
    }
  }
}

// Example usage in a plugin worker
self.onmessage = (event) => {
  const { type, api } = event.data;

  if (type === "init") {
    // Initialize the agent
    const agent = new AgentTerminalExample(api);

    // Example: Auto-build when files change
    agent.buildProject();

    // Example: Run tests periodically
    setInterval(() => {
      agent.runTests();
    }, 300000); // Every 5 minutes
  }
};
