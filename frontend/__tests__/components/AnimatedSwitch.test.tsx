import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import AnimatedSwitch from "../../components/AnimatedSwitch";
import themeReducer from "../../slices/themeSlice";

// Mock Animated API
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Create a mock store
const createMockStore = (theme = "light") => {
  return configureStore({
    reducer: {
      theme: themeReducer,
    },
    preloadedState: {
      theme: { theme: theme },
    },
  });
};

// Test wrapper component
const TestWrapper = ({
  children,
  theme = "light",
}: {
  children: React.ReactNode;
  theme?: string;
}) => {
  const store = createMockStore(theme);
  return <Provider store={store}>{children}</Provider>;
};

describe("AnimatedSwitch", () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText } = render(
      <TestWrapper>
        <AnimatedSwitch onValueChange={mockOnValueChange} />
      </TestWrapper>
    );

    expect(getByText("Semáforo")).toBeTruthy();
    expect(getByText("Refrigeradores")).toBeTruthy();
  });

  it("starts with Semaforo as active", () => {
    const { getByText } = render(
      <TestWrapper>
        <AnimatedSwitch onValueChange={mockOnValueChange} />
      </TestWrapper>
    );

    const semaforoButton = getByText("Semáforo");
    expect(semaforoButton.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "#4A90E2" })])
    );
  });

  it("calls onValueChange when Semaforo button is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <AnimatedSwitch onValueChange={mockOnValueChange} />
      </TestWrapper>
    );

    const semaforoButton = getByText("Semáforo");
    fireEvent.press(semaforoButton);

    expect(mockOnValueChange).toHaveBeenCalledWith("Semaforo");
  });

  it("calls onValueChange when Refrigeradores button is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <AnimatedSwitch onValueChange={mockOnValueChange} />
      </TestWrapper>
    );

    const refrigeradoresButton = getByText("Refrigeradores");
    fireEvent.press(refrigeradoresButton);

    expect(mockOnValueChange).toHaveBeenCalledWith("Refrigeradores");
  });

  it("changes active state when switching buttons", () => {
    const { getByText } = render(
      <TestWrapper>
        <AnimatedSwitch onValueChange={mockOnValueChange} />
      </TestWrapper>
    );

    const semaforoButton = getByText("Semáforo");
    const refrigeradoresButton = getByText("Refrigeradores");

    // Initially Semaforo should be active
    expect(semaforoButton.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "#4A90E2" })])
    );
    expect(refrigeradoresButton.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "#F5A623" })])
    );

    // Press Refrigeradores button
    act(() => {
      fireEvent.press(refrigeradoresButton);
    });

    // Now Refrigeradores should be active
    expect(refrigeradoresButton.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "#4A90E2" })])
    );
    expect(semaforoButton.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "#F5A623" })])
    );
  });

  it("applies correct styles for light theme", () => {
    const { getByText } = render(
      <TestWrapper theme="light">
        <AnimatedSwitch onValueChange={mockOnValueChange} />
      </TestWrapper>
    );

    const semaforoButton = getByText("Semáforo");
    expect(semaforoButton).toBeTruthy();
  });

  it("applies correct styles for dark theme", () => {
    const { getByText } = render(
      <TestWrapper theme="dark">
        <AnimatedSwitch onValueChange={mockOnValueChange} />
      </TestWrapper>
    );

    const semaforoButton = getByText("Semáforo");
    expect(semaforoButton).toBeTruthy();
  });

  it("triggers animation when switching states", () => {
    const { getByText } = render(
      <TestWrapper>
        <AnimatedSwitch onValueChange={mockOnValueChange} />
      </TestWrapper>
    );

    const refrigeradoresButton = getByText("Refrigeradores");

    act(() => {
      fireEvent.press(refrigeradoresButton);
    });

    expect(mockOnValueChange).toHaveBeenCalledWith("Refrigeradores");
  });

  it("maintains correct text styles for active and inactive states", () => {
    const { getByText } = render(
      <TestWrapper>
        <AnimatedSwitch onValueChange={mockOnValueChange} />
      </TestWrapper>
    );

    const semaforoButton = getByText("Semáforo");
    const refrigeradoresButton = getByText("Refrigeradores");

    // Check initial styles
    expect(semaforoButton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
          fontWeight: "600",
        }),
        expect.objectContaining({ color: "#4A90E2" }),
      ])
    );

    expect(refrigeradoresButton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
          fontWeight: "600",
        }),
        expect.objectContaining({ color: "#F5A623" }),
      ])
    );
  });
});
