import { describe, expect, it } from "vitest";
import {
  InvalidForwardError,
  validateForwardPayload,
} from "../../apps/desktop/server/backend-forward-validation.mjs";

describe("backend forward validation", () => {
  const baseLocal = {
    direction: "local",
    localHost: "127.0.0.1",
    localPort: 8080,
    remoteHost: "127.0.0.1",
    remotePort: 80,
    sessionId: "session-1",
  };

  const baseRemote = {
    direction: "remote",
    localHost: "127.0.0.1",
    localPort: 8080,
    remoteHost: "127.0.0.1",
    remotePort: 80,
    sessionId: "session-1",
  };

  it("accepts valid local and remote forwards", () => {
    expect(() => validateForwardPayload(baseLocal)).not.toThrow();
    expect(() => validateForwardPayload(baseRemote)).not.toThrow();
  });

  it("accepts dynamic remote port (port 0) for remote forwards", () => {
    expect(() =>
      validateForwardPayload({
        ...baseRemote,
        remotePort: 0,
      })
    ).not.toThrow();
  });

  it("rejects port 0 for local forwards", () => {
    expect(() =>
      validateForwardPayload({
        ...baseLocal,
        localPort: 0,
      })
    ).toThrow(InvalidForwardError);

    expect(() =>
      validateForwardPayload({
        ...baseLocal,
        remotePort: 0,
      })
    ).toThrow("Forward ports must be greater than zero");
  });

  it("rejects local port 0 for remote forwards", () => {
    expect(() =>
      validateForwardPayload({
        ...baseRemote,
        localPort: 0,
      })
    ).toThrow("Forward ports must be greater than zero");
  });

  it("rejects missing session id", () => {
    expect(() =>
      validateForwardPayload({
        ...baseLocal,
        sessionId: "   ",
      })
    ).toThrow("Forward is missing a session id");
  });

  it("rejects missing hostnames", () => {
    expect(() =>
      validateForwardPayload({
        ...baseLocal,
        localHost: "",
      })
    ).toThrow("Forward hostnames are required");

    expect(() =>
      validateForwardPayload({
        ...baseLocal,
        remoteHost: "  ",
      })
    ).toThrow("Forward hostnames are required");
  });

  it("rejects invalid directions", () => {
    expect(() =>
      validateForwardPayload({
        ...baseLocal,
        direction: "dynamic",
      })
    ).toThrow("Unsupported forward direction");
  });
});
