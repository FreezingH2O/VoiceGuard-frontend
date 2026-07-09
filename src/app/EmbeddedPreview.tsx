import { createContext, useContext } from 'react'

/**
 * True when an app screen is rendered inside the home-page phone showcase
 * (HomeAppPreviewPhone) rather than the real /app-preview zone. Screens read
 * this to keep the showcase a pure mock — e.g. Settings hides account deletion /
 * logout so a demo tap can never touch the real signed-in session.
 */
const EmbeddedPreviewContext = createContext(false)

export const EmbeddedPreviewProvider = EmbeddedPreviewContext.Provider

export function useEmbeddedPreview(): boolean {
  return useContext(EmbeddedPreviewContext)
}
