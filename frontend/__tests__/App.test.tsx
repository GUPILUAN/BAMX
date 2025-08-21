import React from "react";
import { render } from "@testing-library/react-native";
import { Text, View } from "react-native";

// Simple component tests to verify the setup
describe("Testing Jest", () => {
  test("Jest + Expo works", () => {
    expect(2 * 3).toBe(6);
  });

  test("React Native Testing Library works", () => {
    const TestComponent = () => (
      <View>
        <Text>Hello World</Text>
      </View>
    );

    const { getByText } = render(<TestComponent />);
    expect(getByText("Hello World")).toBeTruthy();
  });
});
