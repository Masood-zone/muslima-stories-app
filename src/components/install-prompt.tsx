"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!deferredPrompt) {
    return null;
  }

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div
      className="install-prompt"
      role="dialog"
      aria-live="polite"
      aria-label="Install app prompt"
    >
      <div className="install-prompt__content">
        <div>
          <p className="install-prompt__eyebrow">Install app</p>
          <h2>Install Muslima Stories Reader?</h2>
        </div>

        <div className="install-prompt__actions">
          <button
            type="button"
            className="install-prompt__button install-prompt__button--secondary"
            onClick={() => setDeferredPrompt(null)}
          >
            Not now
          </button>
          <button
            type="button"
            className="install-prompt__button install-prompt__button--primary"
            onClick={handleInstall}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
