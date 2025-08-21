import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { View, Text, TouchableOpacity } from "react-native";

// Simple Navigation Button Component
interface NavigationButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  testID?: string;
}

const NavigationButton = ({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  testID,
}: NavigationButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return "#cccccc";
    switch (variant) {
      case "primary":
        return "#007bff";
      case "secondary":
        return "#6c757d";
      case "danger":
        return "#dc3545";
      default:
        return "#007bff";
    }
  };

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: getBackgroundColor(),
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text
        style={{
          color: disabled ? "#666666" : "#ffffff",
          fontWeight: "600",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Simple List Item Component
interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  testID?: string;
}

const ListItem = ({
  title,
  subtitle,
  onPress,
  rightElement,
  testID,
}: ListItemProps) => (
  <TouchableOpacity
    testID={testID}
    onPress={onPress}
    disabled={!onPress}
    style={{
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <View style={{ flex: 1 }}>
      <Text
        testID={`${testID}-title`}
        style={{ fontSize: 16, fontWeight: "500" }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          testID={`${testID}-subtitle`}
          style={{ fontSize: 14, color: "#666666", marginTop: 4 }}
        >
          {subtitle}
        </Text>
      )}
    </View>
    {rightElement && <View testID={`${testID}-right`}>{rightElement}</View>}
  </TouchableOpacity>
);

describe("NavigationButton", () => {
  it("renders correctly with title", () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <NavigationButton title="Navigate" onPress={mockPress} />
    );

    expect(getByText("Navigate")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <NavigationButton
        title="Navigate"
        onPress={mockPress}
        testID="nav-button"
      />
    );

    fireEvent.press(getByText("Navigate"));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const mockPress = jest.fn();
    const { getByTestId } = render(
      <NavigationButton
        title="Navigate"
        onPress={mockPress}
        disabled={true}
        testID="nav-button"
      />
    );

    fireEvent.press(getByTestId("nav-button"));
    expect(mockPress).not.toHaveBeenCalled();
  });

  it("applies correct styles for different variants", () => {
    const mockPress = jest.fn();

    const { getByTestId: getPrimary } = render(
      <NavigationButton
        title="Primary"
        onPress={mockPress}
        variant="primary"
        testID="primary-button"
      />
    );

    const { getByTestId: getSecondary } = render(
      <NavigationButton
        title="Secondary"
        onPress={mockPress}
        variant="secondary"
        testID="secondary-button"
      />
    );

    const { getByTestId: getDanger } = render(
      <NavigationButton
        title="Danger"
        onPress={mockPress}
        variant="danger"
        testID="danger-button"
      />
    );

    expect(getPrimary("primary-button").props.style.backgroundColor).toBe(
      "#007bff"
    );
    expect(getSecondary("secondary-button").props.style.backgroundColor).toBe(
      "#6c757d"
    );
    expect(getDanger("danger-button").props.style.backgroundColor).toBe(
      "#dc3545"
    );
  });

  it("applies disabled styles when disabled", () => {
    const mockPress = jest.fn();
    const { getByTestId } = render(
      <NavigationButton
        title="Disabled"
        onPress={mockPress}
        disabled={true}
        testID="disabled-button"
      />
    );

    const button = getByTestId("disabled-button");
    expect(button.props.style.backgroundColor).toBe("#cccccc");
    expect(button.props.style.opacity).toBe(0.6);
  });
});

describe("ListItem", () => {
  it("renders title correctly", () => {
    const { getByText } = render(
      <ListItem title="Test Item" testID="list-item" />
    );

    expect(getByText("Test Item")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    const { getByTestId } = render(
      <ListItem title="Test Item" subtitle="Test Subtitle" testID="list-item" />
    );

    expect(getByTestId("list-item-subtitle")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    const { queryByTestId } = render(
      <ListItem title="Test Item" testID="list-item" />
    );

    expect(queryByTestId("list-item-subtitle")).toBeNull();
  });

  it("calls onPress when pressed", () => {
    const mockPress = jest.fn();
    const { getByTestId } = render(
      <ListItem title="Test Item" onPress={mockPress} testID="list-item" />
    );

    fireEvent.press(getByTestId("list-item"));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it("renders right element when provided", () => {
    const rightElement = <Text>Right</Text>;
    const { getByTestId, getByText } = render(
      <ListItem
        title="Test Item"
        rightElement={rightElement}
        testID="list-item"
      />
    );

    expect(getByTestId("list-item-right")).toBeTruthy();
    expect(getByText("Right")).toBeTruthy();
  });

  it("does not render right element when not provided", () => {
    const { queryByTestId } = render(
      <ListItem title="Test Item" testID="list-item" />
    );

    expect(queryByTestId("list-item-right")).toBeNull();
  });
});
