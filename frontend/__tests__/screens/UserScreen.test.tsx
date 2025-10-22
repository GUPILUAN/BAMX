import React from "react";
import { render } from "@testing-library/react-native";
import UserScreen from "@/screens/UserScreen/UserScreen";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("@/hooks/useUserColorScheme", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/theme", () => ({
  themeColors: {
    background: jest.fn().mockReturnValue("#fff"),
    text: jest.fn().mockReturnValue("#000"),
    headerBackground: jest.fn().mockReturnValue("#eee"),
    headerText: jest.fn().mockReturnValue("#111"),
    secondary: jest.fn().mockReturnValue("#f5f5f5"),
  },
}));

jest.mock("@/slices/userSlice", () => ({
  selectUser: jest.fn(),
}));

import { useSelector } from "react-redux";
import useUserColorScheme from "@/hooks/useUserColorScheme";
import { selectUser } from "@/slices/userSlice";

describe("UserScreen", () => {
  let currentUser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    (useUserColorScheme as jest.Mock).mockReturnValue({ isDark: false });

    (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => {
      if (selector === selectUser) return currentUser;
      return undefined;
    });

    currentUser = undefined; 
  });

  it("shows loading UI when user is undefined", () => {
    const { getByText } = render(<UserScreen />);
    expect(getByText("Loading user data...")).toBeTruthy();
  });

  it("renders name and header info when user exists (with profile picture)", () => {
    currentUser = {
      username: "jdoe",
      name: "John Doe",
      position: "Engineer",
      department: "R&D",
      profile_picture: "BASE64STRING",
      email: "john@company.com",
      phone: "555-1234",
      company: "Acme Corp",
      role: "Admin",
      status: 0,
    };

    const { getByText, queryByText } = render(<UserScreen />);

    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("Engineer · R&D")).toBeTruthy();

    expect(getByText(/E-mail: john@company\.com/i)).toBeTruthy();
    expect(getByText(/Teléfono: 555-1234/i)).toBeTruthy();

    expect(getByText(/Empresa Acme Corp/i)).toBeTruthy();
    expect(getByText(/Rol: Admin/i)).toBeTruthy();
    expect(getByText(/Estado: ✅ Activo/i)).toBeTruthy();

    expect(queryByText("j")).toBeNull();
  });

  it("renders fallback initial when there is no profile picture", () => {
    currentUser = {
      username: "maria",
      name: "María",
      position: "Designer",
      department: "UX",
      email: "maria@company.com",
      phone: "555-0000",
      company: "Acme Corp",
      role: "User",
      status: 1,
      profile_picture: null,
    };

    const { getByText } = render(<UserScreen />);

    expect(getByText("m")).toBeTruthy();
    expect(getByText(/Estado: ❌ Inactivo/i)).toBeTruthy();
  });

  it("uses username when name is missing", () => {
    currentUser = {
      username: "anonuser",
      name: null,
      position: null,
      department: null,
      profile_picture: null,
      email: null,
      phone: null,
      company: null,
      role: null,
      status: undefined, 
    };

    const { getByText } = render(<UserScreen />);

    expect(getByText("anonuser")).toBeTruthy();
    expect(getByText("No position · No department")).toBeTruthy();
    expect(getByText(/E-mail: No disponible/i)).toBeTruthy();
    expect(getByText(/Teléfono: No disponible/i)).toBeTruthy();
    expect(getByText(/Empresa No disponible/i)).toBeTruthy();
    expect(getByText(/Rol: No disponible/i)).toBeTruthy();
    expect(getByText(/Estado: ❌ Inactivo/i)).toBeTruthy();
  });

  it("renders fine in dark mode (sanity check)", () => {
    (useUserColorScheme as jest.Mock).mockReturnValueOnce({ isDark: true });
    currentUser = {
      username: "nightowl",
      name: "Night Owl",
      position: "QA",
      department: "Testing",
      profile_picture: null,
      email: "owl@night.com",
      phone: "000",
      company: "Dark Inc",
      role: "User",
      status: 0,
    };

    const { getByText } = render(<UserScreen />);
    expect(getByText("Night Owl")).toBeTruthy();
    expect(getByText("QA · Testing")).toBeTruthy();
    expect(getByText(/Estado: ✅ Activo/i)).toBeTruthy();
  });

  it("falls back to '?' when username is missing and no profile picture", () => {
    currentUser = {
      username: null,
      name: null,
      position: null,
      department: null,
      profile_picture: null,
      email: null,
      phone: null,
      company: null,
      role: null,
      status: 1,
    };

    const { getByText } = render(<UserScreen />);
    expect(getByText("?")).toBeTruthy();
  });
});
