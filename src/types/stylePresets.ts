/**
 * Style preset types for landing page generation
 */

export type StylePresetId = 
  | 'minimalist' 
  | 'bold' 
  | 'corporate' 
  | 'startup' 
  | 'playful';

export interface StylePreset {
  id: StylePresetId;
  name: string;
  description: string;
  /** Preview colors for UI display */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  /** Design instructions for the LLM */
  instructions: string;
}

export interface StylePresetConfig {
  presets: Record<StylePresetId, StylePreset>;
  default: StylePresetId;
}

