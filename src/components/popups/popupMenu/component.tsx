import React from "react";
import "./popupMenu.css";
import PopupOption from "../popupOption";
import { PopupMenuProps, PopupMenuStates } from "./interface";
import { getIframeDoc } from "../../../utils/reader/docUtil";

class PopupMenu extends React.Component<PopupMenuProps, PopupMenuStates> {
  highlighter: any;
  timer!: NodeJS.Timeout;
  key: any;
  mode: string;
  showNote: boolean;
  isFirstShow: boolean;
  rect: any;
  constructor(props: PopupMenuProps) {
    super(props);
    this.showNote = false;
    this.isFirstShow = false;
    this.highlighter = null;
    this.mode = "";
    this.state = {
      deleteKey: "",
      rect: this.props.rect,
      isRightEdge: false,
    };
    
    // Check if we're on iOS with Capacitor
    this.initializeIOSSupport();
  }
  
  // Initialize iOS support if available (done asynchronously to avoid build errors)
  initializeIOSSupport = async () => {
    try {
      // Dynamic import of iOS text selection utils
      const iOSUtils = await import("../../../utils/reader/iOSTextSelection");
      
      if (iOSUtils.isCapacitoriOS()) {
        iOSUtils.initializeIOSTextSelection();
        this.setupTextSelectionListener();
      }
    } catch (error) {
      // Not on iOS or Capacitor not available - this is fine
    }
  }
  
  // Set up event listener for custom text selection events from iOS
  setupTextSelectionListener() {
    document.addEventListener('custom-text-selection', (event: any) => {
      const { x, y, selectedText } = event.detail;
      if (selectedText) {
        // Create a DOMRect-like object with all required properties
        const rectObj = {
          left: x,
          bottom: y,
          top: y - 5, // Approximate top position
          right: x + 5, // Approximate right position
          x: x,
          y: y - 5, // Approximate y position (top)
          width: 5,
          height: 5,
          toJSON: () => ({ x, y, width: 5, height: 5, top: y - 5, right: x + 5, bottom: y, left: x })
        };
        
        // Cast to DOMRect for TypeScript (since we've added all required properties)
        const rect = rectObj as unknown as DOMRect;
        
        this.setState({ rect }, () => {
          this.showMenu();
        });
      }
    });
  }
  
  UNSAFE_componentWillReceiveProps(nextProps: PopupMenuProps) {
    if (nextProps.rect !== this.props.rect) {
      this.setState(
        {
          rect: nextProps.rect,
        },
        () => {
          this.openMenu();
        }
      );
    }
  }

  handleShowDelete = (deleteKey: string) => {
    this.setState({ deleteKey });
  };
  showMenu = () => {
    let rect = this.state.rect;
    if (!rect) return;
    this.setState({ isRightEdge: false }, () => {
      let { posX, posY } = this.getHtmlPosition(rect);
      this.props.handleOpenMenu(true);
      let popupMenu = document.querySelector(".popup-menu-container");
      popupMenu?.setAttribute("style", `left:${posX}px;top:${posY}px`);
    });
  };
  getHtmlPosition(rect: any) {
    let posY = rect.bottom - this.props.rendition.getPageSize().scrollTop;
    let posX = rect.left + rect.width / 2;
    if (rect.width > this.props.rendition.getPageSize().sectionWidth) {
      posX =
        rect.left +
        rect.width -
        this.props.rendition.getPageSize().sectionWidth / 2;
    }
    if (this.props.rendition.getPageSize().height - rect.height < 188) {
      this.props.handleChangeDirection(true);
      posY = rect.top + 16 + this.props.rendition.getPageSize().top;
    } else if (
      posY <
      this.props.rendition.getPageSize().height -
        188 +
        this.props.rendition.getPageSize().top
    ) {
      this.props.handleChangeDirection(true);
      posY = posY + 16 + this.props.rendition.getPageSize().top;
    } else {
      posY = posY - rect.height - 188 + this.props.rendition.getPageSize().top;
    }
    posX = posX - 80 + this.props.rendition.getPageSize().left;
    return { posX, posY } as any;
  }

  openMenu = async () => {
    this.setState({ deleteKey: "" });
    
    // Check if we're on iOS with Capacitor
    let isiOS = false;
    try {
      const iOSUtils = await import("../../../utils/reader/iOSTextSelection");
      isiOS = iOSUtils.isCapacitoriOS();
    } catch (e) {
      // Not on iOS or Capacitor not available
    }
    
    // If we're on iOS with Capacitor, selection is handled differently
    if (isiOS) {
      // Just set menu mode and continue (selection is handled by the plugin)
      this.props.handleChangeDirection(false);
      if (this.props.isOpenMenu) {
        this.props.handleMenuMode("");
        this.props.handleOpenMenu(false);
        this.props.handleNoteKey("");
        return;
      }
      this.props.handleMenuMode("menu");
      return;
    }
    
    // Standard web handling for other platforms
    let doc = getIframeDoc();
    if (!doc) return;
    let sel = doc.getSelection();
    this.props.handleChangeDirection(false);
    if (this.props.isOpenMenu) {
      this.props.handleMenuMode("");
      this.props.handleOpenMenu(false);
      this.props.handleNoteKey("");
    }
    if (!sel) return;
    if (sel.isCollapsed) {
      this.props.isOpenMenu && this.props.handleOpenMenu(false);
      this.props.handleMenuMode("menu");
      this.props.handleNoteKey("");
      return;
    }
    this.showMenu();
    this.props.handleMenuMode("menu");
  };

  render() {
    const PopupProps = {
      chapterDocIndex: this.props.chapterDocIndex,
      chapter: this.props.chapter,
    };
    return (
      <div>
        <div
          className="popup-menu-container"
          style={this.props.isOpenMenu ? {} : { display: "none" }}
        >
          <div className="popup-menu-box">
            {this.props.menuMode === "menu" ? (
              <PopupOption {...PopupProps} />
            ) : null}
          </div>
          {this.props.menuMode === "menu" &&
            (this.props.isChangeDirection ? (
              <span className="icon-popup popup-menu-triangle-up"></span>
            ) : (
              <span className="icon-popup popup-menu-triangle-down"></span>
            ))}
        </div>
      </div>
    );
  }
}

export default PopupMenu;
