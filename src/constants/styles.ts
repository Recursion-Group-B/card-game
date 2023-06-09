import Size from "./size";

export const helpStyle = {
  font: "24px Arial",
  backgroundColor: "rgb(0,0,0,0.9)",
  color: "#FFFFFF",
  align: "left",
  fixedWidth: Size.D_WIDTH / 1.2,
  padding: {
    x: 20,
    y: 20,
  },
  wordWrap: {
    width: Size.D_WIDTH / 1.2 - 40,
    useAdvancedWrap: true,
  },
};

export const textStyle = {
  font: "40px Arial",
  color: "#FFFFFF",
  strokeThickness: 2,
};
