import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it } from "vitest";
import { AppNavbar } from "..";

const Wrapper = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

describe("App navbar component", () => {
  it("should render", () => {
    render(<AppNavbar />, { wrapper: Wrapper });
  });
});
