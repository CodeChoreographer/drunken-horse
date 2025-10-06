export const palette = {
    primary: "#FF7F50",    // Orange (Primär)
    accent:  "#3366CC",    // Blau (Akzent)
    background: "#1f1f1f", // Anthrazit (dunkler Hintergrund)
    surface: "#2a2a2a",    // Karten/Paneel-Flächen
    text: "#ffffff",       // Standard-Text auf dunkel
    muted: "#9aa0a6",      // Sekundärtext / Labels
    danger: "#FF0000",     // Destruktiv/Fehler
};

// Einheitliches Spacing (8px-Raster)
export const spacing = (n: number) => n * 8;

// Optionale Radius-/Schatten-Tokens (für konsistente UI)
export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
};

export const shadow = {
    // leichte, performante RN-Schatten (iOS/Android verhalten sich etwas anders)
    card: { shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
};
