import React from "react";
import { shallow } from "enzyme";

import MarkupText from "./MarkupText";

describe("MarkupText", () => {
  it("should render correctly", () => {
    const wrapper = shallow(
      <MarkupText text="<CALL>malaysia one two</CALL> cleared for takeoff" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
