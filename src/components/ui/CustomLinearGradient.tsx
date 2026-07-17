import {
  LinearGradient,
  type LinearGradientProps,
} from "expo-linear-gradient";

type CustomLinearGradientProps = Omit<LinearGradientProps, "colors"> & {
  borderRadius?: number;
  colors?: LinearGradientProps["colors"];
};

export function CustomLinearGradient({
  borderRadius = 16,
  colors = ["#5B8DEF", "#6915E0"],
  style,
  ...props
}: CustomLinearGradientProps) {
  return (
    <LinearGradient
      colors={colors}
      style={[{ borderRadius }, style]}
      {...props}
    />
  );
}
