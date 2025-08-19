export const themeColors = {
  primary: (isDark) => (isDark ? "#1a1a1a" : "#ffffff"),
  secondary: (isDark) => (isDark ? "#2d2d2d" : "#f0f0f0"),
  background: (isDark) => (isDark ? "#121212" : "#f9f9f9"),
  text: (isDark) => (isDark ? "#e0e0e0" : "#1a1a1a"),
  hover: (isDark) => (isDark ? "#383838" : "#e0e0e0"),
  active: (isDark) => (isDark ? "#4c4c4c" : "#d3d3d3"),
  headerBackground: (isDark) => (isDark ? "#1a1a1a" : "#ece7dc"),
  headerText: (isDark) => (isDark ? "#ffffff" : "#1a1a1a"),
};
