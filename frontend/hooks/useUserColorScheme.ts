import { selectTheme } from "@/slices/themeSlice";
import { useSelector } from "react-redux";

const useUserColorScheme = () => {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  return { theme, isDark };
};

export default useUserColorScheme;
