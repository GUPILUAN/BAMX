import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AuthScreen from "@/screens/AuthScreen";
import { loginUser } from "@/api/apiCalls";
import { navigate } from "@/functions/NavigationService";
import { Alert } from "react-native";

jest.mock("@/api/apiCalls", () => ({
  loginUser: jest.fn(),
}));

jest.mock("@/functions/NavigationService", () => ({
  navigate: jest.fn(),
}));

jest.spyOn(Alert, "alert");

describe("AuthScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with title and inputs", () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);

    expect(getByText("¡Bienvenido de nuevo!")).toBeTruthy();
    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  it("shows error messages when fields are empty", async () => {
    const { getByText, findByText } = render(<AuthScreen />);

    fireEvent.press(getByText("INICIAR SESIÓN"));

    expect(await findByText("El username es requerido")).toBeTruthy();
    expect(await findByText("La contraseña es requerida")).toBeTruthy();
  });

  it("calls loginUser with username and password", async () => {
    (loginUser as jest.Mock).mockResolvedValueOnce({});
    const { getByPlaceholderText, getByText } = render(<AuthScreen />);

    fireEvent.changeText(getByPlaceholderText("Username"), "bamxUser");
    fireEvent.changeText(getByPlaceholderText("Password"), "secret123");
    fireEvent.press(getByText("INICIAR SESIÓN"));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("bamxUser", "secret123");
      expect(navigate).toHaveBeenCalledWith("Dashboard");
    });
  });

  it("shows ActivityIndicator while loading", async () => {
    (loginUser as jest.Mock).mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText, getByTestId, queryByTestId } =
      render(<AuthScreen />);

    fireEvent.changeText(getByPlaceholderText("Username"), "bamxUser");
    fireEvent.changeText(getByPlaceholderText("Password"), "secret123");
    fireEvent.press(getByText("INICIAR SESIÓN"));

    expect(getByTestId("ActivityIndicator")).toBeTruthy();

    await waitFor(() => {
      expect(queryByTestId("ActivityIndicator")).toBeNull();
    });
  });

  it("shows alert when login fails", async () => {
    (loginUser as jest.Mock).mockRejectedValueOnce(new Error("Invalid creds"));
    const { getByPlaceholderText, getByText } = render(<AuthScreen />);

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
