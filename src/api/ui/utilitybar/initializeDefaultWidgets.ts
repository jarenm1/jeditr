import { registerUtilityBarWidget } from './utilitybarStore';
import { createLanguageWidget } from './defaultWidgets/filetype/FileType';

/**
 * Initialize and register all default utility bar widgets
 * 
 * This should be called during app initialization to set up
 * the built-in widgets for the utility bar.
 */
export function initializeDefaultWidgets() {
  // Register the language widget
  registerUtilityBarWidget(createLanguageWidget());
  
  // Add more default widgets here as they are created
  // registerUtilityBarWidget(createVimModeWidget());
  // registerUtilityBarWidget(createGitStatusWidget());
  // registerUtilityBarWidget(createErrorCountWidget());
} 