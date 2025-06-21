import React, { useEffect, useState } from "react";
import { PickerModal, PickerItem } from "./PickerModal";
import { loadAllThemes, applyTheme, Theme } from "@services/themeLoader";

export interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [themes, setThemes] = useState<PickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);

      loadAllThemes()
        .then((themeList) => {
          setThemes(
            themeList.map((theme) => ({
              label: theme.name,
              value: theme,
            })),
          );
          setLoading(false);
        })
        .catch((err) => {
          setError(typeof err === "string" ? err : "Failed to load themes");
          setLoading(false);
        });
    } else {
      setThemes([]);
      setError(null);
    }
  }, [isOpen]);

  const handleThemeSelect = (item: PickerItem) => {
    const theme = item.value as Theme;
    try {
      applyTheme(theme);
      onSelect?.(theme);
      onClose();
    } catch (err) {
      setError("Failed to apply theme");
      console.error("Theme application error:", err);
    }
  };

  const renderThemeItem = (item: PickerItem) => {
    const theme = item.value as Theme;

    return (
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {/* Theme preview colors */}
          <div
            className="w-3 h-3 rounded-full border border-gray-600"
            style={{
              backgroundColor: theme.colors["--theme-bg-primary"] || "#000",
            }}
          />
          <div
            className="w-3 h-3 rounded-full border border-gray-600"
            style={{
              backgroundColor: theme.colors["--theme-accent-primary"] || "#00f",
            }}
          />
          <div
            className="w-3 h-3 rounded-full border border-gray-600"
            style={{
              backgroundColor: theme.colors["--theme-text-primary"] || "#fff",
            }}
          />
        </div>
        <span>{theme.name}</span>
      </div>
    );
  };

  return (
    <PickerModal
      isOpen={isOpen}
      onClose={onClose}
      items={themes}
      onSelect={handleThemeSelect}
      title={
        loading
          ? "Loading themes..."
          : error
            ? `Error: ${error}`
            : "Select Theme"
      }
      renderItem={renderThemeItem}
    />
  );
};
