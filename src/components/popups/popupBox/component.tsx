import React from "react";
import "./popupMenu.css";
import PopupNote from "../popupNote";
import PopupTrans from "../popupTrans";
import PopupDict from "../popupDict";
import { PopupBoxProps, PopupBoxStates } from "./interface";
import { getIframeDoc } from "../../../utils/reader/docUtil";
import PopupAssist from "../popupAssist";
import PopupFictionChat from "../popupFictionChat";

class PopupBox extends React.Component<PopupBoxProps, PopupBoxStates> {
  highlighter: any;
  timer!: NodeJS.Timeout;
  key: any;
  mode: string;
  showNote: boolean;
  isFirstShow: boolean;
  rect: any;
  constructor(props: PopupBoxProps) {
    super(props);
    this.showNote = false;
    this.isFirstShow = false;
    this.highlighter = null;
    this.mode = "";
    this.state = {
      deleteKey: "",
      rect: this.props.rect,
      position: {
        x: 0,
        y: 0
      },
      isDragging: false
    };
    
    // Bind event handlers
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }
  handleClose() {
    this.props.handleOpenMenu(false);
    this.props.handleNoteKey("");
    this.props.handleMenuMode("");
    let doc = getIframeDoc();
    if (!doc) return;
    doc.getSelection()?.empty();
  }
  
  componentDidMount() {
    // Center the popup in the middle of the viewport when it mounts
    const container = document.querySelector('.popup-box-container') as HTMLElement;
    if (container) {
      const viewport = document.documentElement;
      const centerX = (viewport.clientWidth - container.offsetWidth) / 2;
      const centerY = (viewport.clientHeight - container.offsetHeight) / 2;
      
      container.style.left = `${centerX}px`;
      container.style.top = `${centerY}px`;
      container.style.bottom = 'auto'; // Override the default bottom positioning
    }
  }

  // Handle mouse down event to start dragging
  handleMouseDown(e: React.MouseEvent) {
    // Only start dragging when clicking on the title area
    if ((e.target as HTMLElement).classList.contains('fiction-chat-title') ||
        (e.target as HTMLElement).classList.contains('popup-title')) {
      this.setState({
        isDragging: true,
        position: {
          x: e.clientX,
          y: e.clientY
        }
      });
      
      // Add listeners for mouse move and up events
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
      
      // Prevent default behavior
      e.preventDefault();
    }
  }
  
  // Handle mouse move event while dragging
  handleMouseMove(e: MouseEvent) {
    if (!this.state.isDragging) return;
    
    const container = document.querySelector('.popup-box-container') as HTMLElement;
    if (!container) return;
    
    // Calculate how much the mouse has moved
    const dx = e.clientX - this.state.position.x;
    const dy = e.clientY - this.state.position.y;
    
    // Get current position
    const rect = container.getBoundingClientRect();
    
    // Update position
    container.style.left = `${rect.left + dx}px`;
    container.style.top = `${rect.top + dy}px`;
    
    // Update state with new mouse position
    this.setState({
      position: {
        x: e.clientX,
        y: e.clientY
      }
    });
  }
  
  // Handle mouse up event to stop dragging
  handleMouseUp() {
    this.setState({ isDragging: false });
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
  
  componentWillUnmount() {
    // Clean up event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
  render() {
    const PopupProps = {
      chapterDocIndex: this.props.chapterDocIndex,
      chapter: this.props.chapter,
    };
    return (
      <>
        <div
          className="popup-box-container"
          style={{ 
            marginLeft: this.props.isNavLocked ? 150 : 0,
            cursor: this.state.isDragging ? 'grabbing' : 'default'
          }}
          onMouseDown={this.handleMouseDown}
        >
          {this.props.menuMode === "note" ? (
            <PopupNote {...PopupProps} />
          ) : this.props.menuMode === "trans" ? (
            <PopupTrans {...PopupProps} />
          ) : this.props.menuMode === "dict" ? (
            <PopupDict {...PopupProps} />
          ) : this.props.menuMode === "assistant" ? (
            <PopupAssist {...PopupProps} />
          ) : this.props.menuMode === "fictionchat" ? (
            <PopupFictionChat {...PopupProps as any} />
          ) : null}
          <span
            className="icon-close popup-close"
            onClick={() => {
              this.handleClose();
            }}
            style={{ top: "-30px", left: "calc(50% - 10px)" }}
          ></span>
        </div>
        <div
          className="drag-background"
          onClick={() => {
            this.handleClose();
          }}
        ></div>
      </>
    );
  }
}

export default PopupBox;
