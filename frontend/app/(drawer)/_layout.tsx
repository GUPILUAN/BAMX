import { Drawer } from 'expo-router/drawer';
import { useSelector } from 'react-redux';
import { selectTheme } from '@/slices/themeSlice';
import { themeColors } from '@/theme';
import SideBar from '@/components/SideBar/SideBar';

export default function DrawerLayout() {
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 240,
        },
        headerStyle: {
          backgroundColor: themeColors.headerBackground(isDark),
        },
        headerTintColor: themeColors.headerText(isDark),
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
       drawerContent={(props) => <SideBar {...props} />}
    />
  );
}