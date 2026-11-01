"use client";

import { createContext, useContext } from "react";

/**
 * Lets the page shell know whether the active section has unsaved edits (for the
 * "Discard unsaved changes?" prompt when switching sections). SettingsSaveBar reports into it,
 * so sections don't need any wiring of their own.
 */
export const SettingsDirtyContext = createContext<((dirty: boolean) => void) | null>(null);

export const useReportSettingsDirty = () => useContext(SettingsDirtyContext);

export default SettingsDirtyContext;
