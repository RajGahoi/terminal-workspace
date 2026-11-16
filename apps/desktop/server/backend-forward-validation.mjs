// Forward-request validation for the Node backend, factored out so it can be
// unit-tested without binding a port on import.

export class InvalidForwardError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "InvalidForwardError";
    this.statusCode = statusCode;
  }
}

/**
 * Validate a port forward payload across both runtimes.
 *
 * Rules:
 * - Direction must be "local" or "remote".
 * - Session ID and hostnames must be non-empty strings.
 * - Local port must be an integer between 1 and 65535.
 * - For local forwards, remote port must be an integer between 1 and 65535.
 * - For remote forwards, remote port can be 0 (requesting dynamic allocation from the SSH server)
 *   or an integer between 1 and 65535.
 */
export function validateForwardPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new InvalidForwardError("Forward payload is required");
  }

  if (typeof payload.sessionId !== "string" || !payload.sessionId.trim()) {
    throw new InvalidForwardError("Forward is missing a session id");
  }

  if (
    typeof payload.localHost !== "string" ||
    !payload.localHost.trim() ||
    typeof payload.remoteHost !== "string" ||
    !payload.remoteHost.trim()
  ) {
    throw new InvalidForwardError("Forward hostnames are required");
  }

  if (payload.direction !== "local" && payload.direction !== "remote") {
    throw new InvalidForwardError("Unsupported forward direction");
  }

  const localPort = Number(payload.localPort);
  const remotePort = Number(payload.remotePort);

  if (
    !Number.isInteger(localPort) ||
    localPort <= 0 ||
    localPort > 65535 ||
    !Number.isInteger(remotePort) ||
    remotePort < 0 ||
    remotePort > 65535 ||
    (payload.direction === "local" && remotePort === 0)
  ) {
    throw new InvalidForwardError("Forward ports must be greater than zero");
  }
}
