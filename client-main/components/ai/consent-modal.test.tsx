/* eslint-env jest */
import React from "react";
import { render, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AIConsentModal } from "./consent-modal";

jest.mock("@/contexts/EnhancedUserContext", () => ({
  useEnhancedUser: () => ({
    user: { id: "1", name: "Test User", email: "test@test.com", role: "student" },
  }),
}));

jest.mock("@/services/legal.service", () => ({
  legalService: {
    getPreferences: jest.fn().mockResolvedValue({ aiFeatures: false }),
    updatePreferences: jest.fn().mockResolvedValue({ aiFeatures: true }),
  },
}));

describe("AIConsentModal", () => {
  beforeEach(() => {
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        clear: () => {
          store = {};
        },
      };
    })();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      configurable: true,
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should show the modal after a delay", async () => {
    render(<AIConsentModal />);

    expect(screen.queryByText(/AI-Powered Learning/i)).not.toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/AI-Powered Learning/i)).toBeInTheDocument();
  });

  it('should close when "Maybe Later" is clicked', async () => {
    render(<AIConsentModal />);

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    const closeButton = screen.getByText(/Maybe Later/i);
    act(() => {
      closeButton.click();
    });

    expect(screen.queryByText(/AI-Powered Learning/i)).not.toBeInTheDocument();
  });
});
