import BookModel from "../../../models/Book";
import Plugin from "../../../models/Plugin";

export interface PopupFictionChatProps {
  originalText?: string;
  plugins?: Plugin[];
  isAuthed?: boolean;
  currentBook: BookModel;
  menuMode?: string;
  isOpenMenu?: boolean;
  notes?: any[];
  books?: any[];
  color?: number;
  currentChapter?: string;
  tReady?: boolean;
  i18n?: any;
  handleOpenMenu: (isOpenMenu: boolean) => void;
  handleMenuMode: (menu: string) => void;
  handleFetchPlugins?: () => void;
  t: (title: string) => string;
}

export interface PopupFictionChatState {
  responseText: string;
  originalText: string | undefined;
  userQuestion: string;
  modelName: string;
  provider: string;
  isLoading: boolean;
  chatHistory: Array<{role: string, content: string}>;
  showKeyInput: boolean;
  apiKeyInput: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
}

export interface AIProvider {
  id: string;
  name: string;
  requiresKey: boolean;
  models: AIModel[];
}