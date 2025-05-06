import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import PopupFictionChat from "./component";
import { handleOpenMenu, handleMenuMode } from "../../../store/actions/viewArea";
import { handleFetchPlugins } from "../../../store/actions/manager";

const mapStateToProps = (state: any) => {
  return {
    currentBook: state.book.currentBook,
    currentChapter: state.reader.currentChapter,
    isOpenMenu: state.viewArea.isOpenMenu,
    menuMode: state.viewArea.menuMode,
    notes: state.reader.notes,
    books: state.manager.books,
    isAuthed: state.manager.isAuthed,
    originalText: state.reader.originalText,
    color: state.reader.color,
    plugins: state.manager.plugins || []
  };
};

const actionCreator = {
  handleOpenMenu,
  handleMenuMode,
  handleFetchPlugins
};

// Approach that bypasses React version compatibility issues
const TranslatedComponent = withTranslation()(PopupFictionChat as any) as any;

export default connect(
  mapStateToProps, 
  actionCreator
)(TranslatedComponent);