import React from "react";
import "./popupFictionChat.css";
import { AIModel, AIProvider, PopupFictionChatProps, PopupFictionChatState } from "./interface";
import { Trans } from "react-i18next";
import toast from "react-hot-toast";
import { getChatCompletion } from "../../../utils/request/reader";

// Define available providers with their models
const AI_PROVIDERS: AIProvider[] = [
  {
    id: "ollama",
    name: "Ollama (Local)",
    requiresKey: false,
    models: [
      { id: "llama3.3", name: "Llama 3.3 (42GB)", provider: "ollama" },
      { id: "llama3.2", name: "Llama 3.2 (2GB)", provider: "ollama" },
      { id: "gemma3:27b", name: "Gemma 3 (27b)", provider: "ollama" },
      { id: "deepseek-r1:32b", name: "Deepseek R1 (32b)", provider: "ollama" }
    ]
  },
  {
    id: "openai",
    name: "OpenAI",
    requiresKey: true,
    models: [
      { id: "o4-mini", name: "o4-mini", provider: "openai" },
      //{ id: "o3-mini", name: "o3-mini", provider: "openai" }, // No access to this as of May 6 2025
      { id: "gpt-4o-mini", name: "gpt-4o-mini", provider: "openai" }
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    requiresKey: true,
    models: [
      { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet", provider: "anthropic" },
      { id: "claude-3-7-sonnet-latest", name: "Claude 3.7 Sonnet Latest", provider: "anthropic" }
    ]
  },
  {
    id: "google",
    name: "Google",
    requiresKey: true,
    models: [
      { id: "gemini-2.5-pro-preview-05-06", name: "Gemini 2.5 Pro Preview", provider: "google" },
      { id: "gemini-2.5-flash-preview-04-17", name: "Gemini 2.5 Flash Preview", provider: "google" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google" }

    ]
  }
];

class PopupFictionChat extends React.Component<PopupFictionChatProps, PopupFictionChatState> {
  constructor(props: PopupFictionChatProps) {
    super(props);
    this.state = {
      responseText: "",
      originalText: this.props.originalText,
      userQuestion: "", // Initialize empty user question
      modelName: "llama3.3", // Default model
      provider: "ollama", // Default provider
      isLoading: false,
      chatHistory: [],
      showKeyInput: false, // For API key input dialog
      apiKeyInput: "", // For API key input
    };
  }

  componentDidMount() {
    // Load original text from props
    this.setState({ originalText: this.props.originalText });
  }

  handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value;
    // Get the first model of the selected provider
    const firstModel = AI_PROVIDERS.find(p => p.id === provider)?.models[0]?.id || "";
    
    this.setState({ 
      provider,
      modelName: firstModel
    }, () => {
      // Force a re-render to update the API key status
      this.forceUpdate();
    });
  };

  handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ modelName: e.target.value });
  };
  
  handleUserQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ userQuestion: e.target.value });
  };

  handleChat = async () => {
    const { originalText, userQuestion, modelName, provider, chatHistory } = this.state;
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
      
      // For remote API calls (OpenAI, Anthropic, Google), we need to construct a model string with provider prefix
      const fullModelName = provider === 'ollama' ? modelName : `${provider}:${modelName}`;
      
      let response = await getChatCompletion(prompt, fullModelName);
      
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

  state = {
    responseText: "",
    originalText: this.props.originalText,
    userQuestion: "", // Initialize empty user question
    modelName: "llama3.3", // Default model
    provider: "ollama", // Default provider
    isLoading: false,
    chatHistory: [],
    showKeyInput: false, // For API key input dialog
    apiKeyInput: "", // For API key input
  };

  // Show API key input dialog
  handleSetApiKey = () => {
    this.setState({ showKeyInput: true });
  };

  // Handle API key input change
  handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ apiKeyInput: e.target.value });
  };

  // Save the API key
  handleSaveApiKey = () => {
    const { provider, apiKeyInput } = this.state;
    
    if (apiKeyInput) {
      try {
        // Save API key to ConfigService based on provider
        const configKey = `${provider}Key`;
        // Use ConfigService directly instead of Electron remote
        const { ConfigService } = require("../../../assets/lib/kookit-extra-browser.min");
        ConfigService.setReaderConfig(configKey, apiKeyInput);
        
        toast.success(this.props.t(`${provider.toUpperCase()} API key saved`));
        this.setState({ showKeyInput: false, apiKeyInput: "" }, () => {
          // Force re-render to update the API key status display
          this.forceUpdate();
        });
      } catch (error) {
        console.error("Error saving API key:", error);
        toast.error(this.props.t("Failed to save API key"));
      }
    }
  };

  // Cancel API key input
  handleCancelApiKey = () => {
    this.setState({ showKeyInput: false, apiKeyInput: "" });
  };

  // Check if a provider has an API key set
  hasApiKey = (provider: string): boolean => {
    try {
      // Use ConfigService to check if the key exists
      const { ConfigService } = require("../../../assets/lib/kookit-extra-browser.min");
      const configKey = `${provider}Key`;
      const apiKey = ConfigService.getReaderConfig(configKey);
      return !!apiKey; // Return true if key exists and is not empty
    } catch (error) {
      console.error("Error checking API key:", error);
      return false;
    }
  };

  render() {
    const { originalText, userQuestion, responseText, isLoading, provider, modelName, showKeyInput, apiKeyInput } = this.state;
    
    // Get the current provider's models
    const currentProvider = AI_PROVIDERS.find(p => p.id === provider);
    const models = currentProvider?.models || [];
    
    // Check if the current provider has an API key set
    const hasKey = this.hasApiKey(provider);
    
    return (
      <div className="fiction-chat-container">
        {/* API Key Input Dialog */}
        {showKeyInput && (
          <div className="fiction-chat-api-key-dialog">
            <div className="fiction-chat-api-key-dialog-content">
              <div className="fiction-chat-api-key-dialog-title">
                <Trans>Enter {currentProvider?.name} API Key</Trans>
              </div>
              <input
                type="password"
                className="fiction-chat-api-key-dialog-input"
                placeholder={this.props.t("API Key")}
                value={apiKeyInput}
                onChange={this.handleApiKeyChange}
                autoFocus
              />
              <div className="fiction-chat-api-key-dialog-actions">
                <button 
                  className="fiction-chat-api-key-dialog-button fiction-chat-api-key-dialog-button-cancel"
                  onClick={this.handleCancelApiKey}
                >
                  <Trans>Cancel</Trans>
                </button>
                <button 
                  className="fiction-chat-api-key-dialog-button fiction-chat-api-key-dialog-button-save"
                  onClick={this.handleSaveApiKey}
                  disabled={!apiKeyInput}
                >
                  <Trans>Save</Trans>
                </button>
              </div>
            </div>
          </div>
        )}
      
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
        
        <div className="fiction-chat-controls">
          <div className="fiction-chat-ai-selector">
            <div className="fiction-chat-provider-container">
              <label htmlFor="provider-select" className="fiction-chat-select-label">
                <Trans>Provider:</Trans>
              </label>
              <select 
                id="provider-select"
                className="fiction-chat-provider" 
                value={provider}
                onChange={this.handleProviderChange}
                disabled={isLoading}
              >
                {AI_PROVIDERS.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="fiction-chat-model-container">
              <label htmlFor="model-select" className="fiction-chat-select-label">
                <Trans>Model:</Trans>
              </label>
              <select 
                id="model-select"
                className="fiction-chat-model" 
                value={modelName}
                onChange={this.handleModelChange}
                disabled={isLoading}
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Show API key info for remote providers */}
          {currentProvider?.requiresKey && (
            <div className="fiction-chat-api-key-info">
              <div className="api-key-container">
                {hasKey ? (
                  <small className="api-key-status api-key-status-set">
                    <Trans>{currentProvider.name} API key is set</Trans>
                  </small>
                ) : (
                  <small className="api-key-status">
                    <Trans>Requires {currentProvider.name} API key</Trans>
                  </small>
                )}
                <button 
                  className="fiction-chat-api-key-button"
                  onClick={this.handleSetApiKey}
                  disabled={isLoading}
                >
                  <Trans>{hasKey ? 'Change API Key' : 'Set API Key'}</Trans>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="fiction-chat-footer">
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