import React from "react";
import ReactDOM from "react-dom";

interface Props {
  selector: string;
}

export default class Portal extends React.Component<Props, never> {
  public element: Element | null = null;
  public componentDidMount() {
    this.element = document.querySelector(this.props.selector);
    this.forceUpdate();
  }

  public render() {
    if (this.element === null) {
      return null;
    }

    return ReactDOM.createPortal(this.props.children, this.element);
  }
}
