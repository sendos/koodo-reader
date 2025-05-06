import React from "react";
import "./popupFictionChat.css";
import { PopupFictionChatProps, PopupFictionChatState } from "./interface";
import { Trans } from "react-i18next";
import toast from "react-hot-toast";
import { getChatCompletion } from "../../../utils/request/reader";

class PopupFictionChat extends React.Component<PopupFictionChatProps, PopupFictionChatState> {
  constructor(props: PopupFictionChatProps) {
    super(props);
    this.state = {
      responseText: "",
      originalText: this.props.originalText,
      userQuestion: "", // Initialize empty user question
      modelName: "llama3", // Default model
      isLoading: false,
      chatHistory: []
    };
  }

  componentDidMount() {
    // Load original text from props
    this.setState({ originalText: this.props.originalText });
  }

  handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ modelName: e.target.value });
  };
  
  handleUserQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ userQuestion: e.target.value });
  };

  handleChat = async () => {
    const { originalText, userQuestion, modelName, chatHistory } = this.state;
    const { currentBook } = this.props;
    
    if (!originalText || this.state.isLoading) return;
    
    this.setState({ isLoading: true, responseText: "" });
    
    try {
      // Create a combined message with both the original text and user question
      const userMessage = userQuestion 
        ? `Text: "${originalText}"\nMy question: ${userQuestion}`
        : originalText;
      
      // Add user message to chat history
      const updatedHistory = [...chatHistory, { role: "user", content: userMessage }];
      this.setState({ chatHistory: updatedHistory });
      
      // Get book title and author
      const bookTitle = currentBook.name || "Unknown";
      const author = currentBook.author || "Unknown";
      const bookPage = currentBook.page || "Unknown";

      // Create an enhanced prompt that includes book title, author, and user question
      let prompt = `You are a character from the book "${bookTitle}" by ${author}. The reader has so far read up to page ${bookPage}, and has selected this text from the book: "${originalText}".`;

      // Add the user's question if they provided one
      if (userQuestion) {
        prompt += `\n\nThe reader is also asking: "${userQuestion}"`;
      }

      prompt += `\n\nRespond as if you are a character from this text. Your response should match the tone, style, and world of the book. 
      Interact with the reader in a way that feels authentic to the book's setting and characters.
      The response should only include information that is available up to and including page ${bookPage} of the book.
      Please do not include any information that is not in the book or that the reader has not read yet.
      `;
      
      let response = await getChatCompletion(prompt, modelName);
      
      if (response) {
        // Add assistant response to chat history
        const finalHistory = [...updatedHistory, { role: "assistant", content: response }];
        this.setState({ 
          responseText: response,
          chatHistory: finalHistory,
          isLoading: false
        });
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(this.props.t("Failed to get response"));
      this.setState({ isLoading: false });
    }
  };

  handleClose = () => {
    this.props.handleOpenMenu(false);
    this.props.handleMenuMode("");
  };

  render() {
    const { originalText, userQuestion, responseText, isLoading } = this.state;
    
    return (
      <div className="fiction-chat-container">
        <div className="fiction-chat-title">
          <Trans>Chat with the Character</Trans>
        </div>
        
        <div className="fiction-chat-content">{originalText}</div>
        
        <div className="fiction-chat-question-container">
          <label htmlFor="user-question" className="fiction-chat-question-label">
            <Trans>Your question or comment:</Trans>
          </label>
          <textarea
            id="user-question"
            className="fiction-chat-question-input"
            placeholder={this.props.t("Ask the character anything...")}
            value={userQuestion}
            onChange={this.handleUserQuestionChange}
            disabled={isLoading}
          ></textarea>
        </div>
        
        {responseText && (
          <div className="fiction-chat-response">{responseText}</div>
        )}
        
        <div className="fiction-chat-footer">
          <select 
            className="fiction-chat-model" 
            value={this.state.modelName}
            onChange={this.handleModelChange}
            disabled={isLoading}
          >
            <option value="llama3.3">Llama 3.3 (42GB)</option>
            <option value="llama3.2">Llama 3.2 (2GB)</option>
            <option value="gemma3:27b">Gemma 3 (27b)</option>
            <option value="deepseek-r1:32b">Deepseek R1 (32b)</option>
          </select>
          
          <button 
            className="fiction-chat-button fiction-chat-button-primary"
            onClick={isLoading ? undefined : this.handleChat}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="fiction-chat-loading"></span>
            ) : responseText ? (
              <Trans>Chat Again</Trans>
            ) : (
              <Trans>Chat</Trans>
            )}
          </button>
          
          <button 
            className="fiction-chat-button"
            onClick={this.handleClose}
            disabled={isLoading}
          >
            <Trans>Close</Trans>
          </button>
        </div>
      </div>
    );
  }
}

export default PopupFictionChat;