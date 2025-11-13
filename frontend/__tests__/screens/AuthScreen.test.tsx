import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AuthScreen from "@/screens/AuthScreen/AuthScreen";
import { loginUser } from "@/api/axiosInstance";
import { navigate } from "@/functions/NavigationService";
import { Alert } from "react-native";
import themeReducer from "@/slices/themeSlice";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

jest.mock("@/api/apiCalls", () => ({ loginUser: jest.fn() }));
jest.mock("@/functions/NavigationService", () => ({ navigate: jest.fn() }));

jest.spyOn(Alert, "alert");

const createMockStore = (theme = "light") =>
  configureStore({
    reducer: { theme: themeReducer },
    preloadedState: { theme: { theme } },
  });

const TestWrapper = ({
  children,
  theme = "light",
}: {
  children: React.ReactNode;
  theme?: string;
}) => <Provider store={createMockStore(theme)}>{children}</Provider>;

describe("AuthScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders correctly with title and inputs", () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <AuthScreen />
      </TestWrapper>
    );

    expect(getByText("¡Bienvenido de nuevo!")).toBeTruthy();
    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  it("shows error messages when fields are empty", async () => {
    const { getByText, findByText } = render(
      <TestWrapper>
        <AuthScreen />
      </TestWrapper>
    );

    fireEvent.press(getByText("INICIAR SESIÓN"));

    expect(await findByText("El username es requerido")).toBeTruthy();
    expect(await findByText("La contraseña es requerida")).toBeTruthy();
  });

  it("calls loginUser with username and password", async () => {
    (loginUser as jest.Mock).mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <AuthScreen />
      </TestWrapper>
    );

    fireEvent.changeText(getByPlaceholderText("Username"), "bamxUser");
    fireEvent.changeText(getByPlaceholderText("Password"), "secret123");
    fireEvent.press(getByText("INICIAR SESIÓN"));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("bamxUser", "secret123");
      expect(navigate).toHaveBeenCalledWith("Dashboard");
    });
  });

  it("shows ActivityIndicator while loading", async () => {
    (loginUser as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({}), 50);
        })
    );

    const { getByPlaceholderText, getByText, findByTestId, queryByTestId } =
      render(
        <TestWrapper>
          <AuthScreen />
        </TestWrapper>
      );

    fireEvent.changeText(getByPlaceholderText("Username"), "bamxUser");
    fireEvent.changeText(getByPlaceholderText("Password"), "secret123");
    fireEvent.press(getByText("INICIAR SESIÓN"));

    await findByTestId("ActivityIndicator");

    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("bamxUser", "secret123");
      expect(navigate).toHaveBeenCalledWith("Dashboard");
    });

    await waitFor(() => {
      expect(queryByTestId("ActivityIndicator")).toBeNull();
    });
  });

  it("shows alert when login fails", async () => {
    (loginUser as jest.Mock).mockRejectedValueOnce(new Error("Invalid creds"));

    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <AuthScreen />
      </TestWrapper>
    );

    fireEvent.changeText(getByPlaceholderText("Username"), "wrongUser");
    fireEvent.changeText(getByPlaceholderText("Password"), "wrongPass");
    fireEvent.press(getByText("INICIAR SESIÓN"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Las credenciales son incorrectas"
      );
    });
  });
});
