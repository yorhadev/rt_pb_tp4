import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it } from "vitest";
import { AppThemeFab } from "..";

const Wrapper = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

describe("App logo component", () => {
  it("should render", () => {
    render(<AppThemeFab />, { wrapper: Wrapper });
  });
});
