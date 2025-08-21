import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { View, Text, TouchableOpacity, Image } from "react-native";

// Simplified ProductCard component for testing
interface SimpleProductCardProps {
  productName: string;
  imageUri?: string;
  onInfoPress?: () => void;
  onDeliverPress?: () => void;
  onDiscardPress?: () => void;
}

const SimpleProductCard = ({
  productName,
  imageUri,
  onInfoPress,
  onDeliverPress,
  onDiscardPress,
}: SimpleProductCardProps) => (
  <View testID="product-card">
    {imageUri && (
      <Image
        testID="product-image"
        source={{ uri: imageUri }}
        style={{ width: 100, height: 100 }}
      />
    )}
    <Text testID="product-name">{productName}</Text>

    {onInfoPress && (
      <TouchableOpacity testID="info-button" onPress={onInfoPress}>
        <Text>Info</Text>
      </TouchableOpacity>
    )}

    <View testID="action-buttons">
      {onDeliverPress && (
        <TouchableOpacity testID="deliver-button" onPress={onDeliverPress}>
          <Text>Entregar</Text>
        </TouchableOpacity>
      )}
      {onDiscardPress && (
        <TouchableOpacity testID="discard-button" onPress={onDiscardPress}>
          <Text>Desechar</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

describe("SimpleProductCard", () => {
  const defaultProps = {
    productName: "Test Product",
    onInfoPress: jest.fn(),
    onDeliverPress: jest.fn(),
    onDiscardPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders product name correctly", () => {
    const { getByTestId, getByText } = render(
      <SimpleProductCard {...defaultProps} />
    );

    expect(getByTestId("product-card")).toBeTruthy();
    expect(getByTestId("product-name")).toBeTruthy();
    expect(getByText("Test Product")).toBeTruthy();
  });

  it("renders image when imageUri is provided", () => {
    const { getByTestId } = render(
      <SimpleProductCard
        {...defaultProps}
        imageUri="https://example.com/image.jpg"
      />
    );

    expect(getByTestId("product-image")).toBeTruthy();
  });

  it("does not render image when imageUri is not provided", () => {
    const { queryByTestId } = render(<SimpleProductCard {...defaultProps} />);

    expect(queryByTestId("product-image")).toBeNull();
  });

  it("calls onInfoPress when info button is pressed", () => {
    const mockInfoPress = jest.fn();
    const { getByTestId } = render(
      <SimpleProductCard {...defaultProps} onInfoPress={mockInfoPress} />
    );

    fireEvent.press(getByTestId("info-button"));
    expect(mockInfoPress).toHaveBeenCalledTimes(1);
  });

  it("calls onDeliverPress when deliver button is pressed", () => {
    const mockDeliverPress = jest.fn();
    const { getByTestId } = render(
      <SimpleProductCard {...defaultProps} onDeliverPress={mockDeliverPress} />
    );

    fireEvent.press(getByTestId("deliver-button"));
    expect(mockDeliverPress).toHaveBeenCalledTimes(1);
  });

  it("calls onDiscardPress when discard button is pressed", () => {
    const mockDiscardPress = jest.fn();
    const { getByTestId } = render(
      <SimpleProductCard {...defaultProps} onDiscardPress={mockDiscardPress} />
    );

    fireEvent.press(getByTestId("discard-button"));
    expect(mockDiscardPress).toHaveBeenCalledTimes(1);
  });

  it("renders action buttons container", () => {
    const { getByTestId } = render(<SimpleProductCard {...defaultProps} />);

    expect(getByTestId("action-buttons")).toBeTruthy();
  });

  it("renders deliver and discard button texts", () => {
    const { getByText } = render(<SimpleProductCard {...defaultProps} />);

    expect(getByText("Entregar")).toBeTruthy();
    expect(getByText("Desechar")).toBeTruthy();
  });

  it("does not render buttons when handlers are not provided", () => {
    const { queryByTestId } = render(
      <SimpleProductCard productName="Test Product" />
    );

    expect(queryByTestId("info-button")).toBeNull();
    expect(queryByTestId("deliver-button")).toBeNull();
    expect(queryByTestId("discard-button")).toBeNull();
  });
});
