import { createNavigationContainerRef } from "@react-navigation/native";
import { StackActions } from "@react-navigation/native";
export const navigationRef = createNavigationContainerRef();

export function replace(name: string, params?: object | undefined) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    const p = { name, params } as never;
    navigationRef.navigate(p);
  }
}
