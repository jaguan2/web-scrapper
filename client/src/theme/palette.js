// Color tokens for Snag, in the same stickery world as Morph. Each mode
// defines a full set of semantic tokens so components never hardcode hex
// values — they read from theme.palette / theme.snag.

// Shared accent "sticker" swatches (also used for platform badges + toggles).
// Mode-agnostic so a swatch is recognizably the same hue in both themes.
export const stickerSwatches = {
  blue: { light: '#bfe3f7', dark: '#5c7191' },
  pink: { light: '#f8cfe8', dark: '#9c5680' },
  mint: { light: '#c6f0e0', dark: '#4f8f79' },
  lemon: { light: '#fbe6b8', dark: '#9a8a4a' },
  peach: { light: '#ffc9b3', dark: '#b3735c' },
  lilac: { light: '#e0d4f7', dark: '#7a6aa0' },
}

export const lightPalette = {
  mode: 'light',
  brand: '#ff9a82',
  background: '#f8ecd3',
  surface: '#ffffff',
  surfaceMuted: '#fbf3e2',
  border: '#cbb89a',
  borderMuted: '#e3d7bf',
  text: '#2c2622',
  textMuted: '#8c8375',
  dropZoneBorder: '#c9beac',
}

export const darkPalette = {
  mode: 'dark',
  brand: '#bfe6f2',
  background: '#262626',
  surface: '#333333',
  surfaceMuted: '#3b3b3b',
  border: '#4d4d4d',
  borderMuted: '#404040',
  text: '#f5f5f5',
  textMuted: '#a3a3a3',
  dropZoneBorder: '#5c5c5c',
}

export const palettes = { light: lightPalette, dark: darkPalette }
