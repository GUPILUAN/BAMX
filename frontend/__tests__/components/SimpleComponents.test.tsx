import React from "react";
import { render } from "@testing-library/react-native";
import { Text, View, TouchableOpacity } from "react-native";

// Simple Button Component for testing
const SimpleButton = ({
  title,
  onPress,
  testID,
}: {
  title: string;
  onPress: () => void;
  testID?: string;
}) => (
  <TouchableOpacity testID={testID} onPress={onPress}>
    <Text>{title}</Text>
  </TouchableOpacity>
);

// Simple Card Component for testing
const SimpleCard = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <View testID="simple-card">
    <Text testID="card-title">{title}</Text>
    {subtitle && <Text testID="card-subtitle">{subtitle}</Text>}
  </View>
);

describe("Simple Components", () => {
  it("renders SimpleButton correctly", () => {
    const mockPress = jest.fn();
    const { getByText, getByTestId } = render(
      <SimpleButton title="Click me" onPress={mockPress} testID="test-button" />
    );

    expect(getByText("Click me")).toBeTruthy();
    expect(getByTestId("test-button")).toBeTruthy();
  });

  it("renders SimpleCard correctly", () => {
    const { getByText, getByTestId } = render(
      <SimpleCard title="Card Title" subtitle="Card Subtitle" />
    );

    expect(getByTestId("simple-card")).toBeTruthy();
    expect(getByTestId("card-title")).toBeTruthy();
    expect(getByTestId("card-subtitle")).toBeTruthy();
    expect(getByText("Card Title")).toBeTruthy();
    expect(getByText("Card Subtitle")).toBeTruthy();
  });

  it("renders SimpleCard without subtitle", () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <SimpleCard title="Card Title" />
    );

    expect(getByTestId("simple-card")).toBeTruthy();
    expect(getByText("Card Title")).toBeTruthy();
    expect(queryByTestId("card-subtitle")).toBeNull();
  });
});
