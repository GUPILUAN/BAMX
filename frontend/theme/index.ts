export const themeColors = {
  primary: (isDark: boolean) => (isDark ? "#1a1a1a" : "#ffffff"),
  secondary: (isDark: boolean) => (isDark ? "#2d2d2d" : "#f0f0f0"),
  background: (isDark: boolean) => (isDark ? "#121212" : "#f9f9f9"),
  text: (isDark: boolean) => (isDark ? "#e0e0e0" : "#1a1a1a"),
  hover: (isDark: boolean) => (isDark ? "#383838" : "#e0e0e0"),
  active: (isDark: boolean) => (isDark ? "#4c4c4c" : "#d3d3d3"),
  headerBackground: (isDark: boolean) => (isDark ? "#1a1a1a" : "#ece7dc"),
  headerText: (isDark: boolean) => (isDark ? "#ffffff" : "#1a1a1a"),
};
