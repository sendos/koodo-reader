import toast from "react-hot-toast";
import {
  ConfigService,
  ReaderRequest,
  TokenService,
} from "../../assets/lib/kookit-extra-browser.min";
import i18n from "../../i18n";
import { handleExitApp } from "./common";
let readerRequest: ReaderRequest;
export const getTransStream = async (
  text: string,
  from: string,
  to: string,
  onMessage: (result) => void
) => {
  let readerRequest = await getReaderRequest();
  let result = await readerRequest.getTransFetch(
    {
      text,
      from,
      to,
    },
    onMessage
  );
  return result;
};
export const getSummaryStream = async (
  text: string,
  to: string,
  onMessage: (result) => void
) => {
  let readerRequest = await getReaderRequest();
  let result = await readerRequest.getSummaryFetch(
    {
      text,
      to,
    },
    onMessage
  );
  return result;
};
export const getChatCompletion = async (
  prompt: string,
  modelSelection: string = "gemma3:27b"
) => {
  try {
    // Parse the model selection to determine provider and model
    const [provider, model] = parseModelSelection(modelSelection);
    
    // Get the appropriate API key based on the provider
    const apiKey = getApiKey(provider);
    
    // If API key is required but not found, show error
    if (needsApiKey(provider) && !apiKey) {
      toast.error(i18n.t(`${provider} API key not found. Please click "Set API Key" to add your key.`));
      return null;
    }
    
    let response;
    let result;
    
    switch (provider) {
      case 'openai':
        // OpenAI API call
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey as string}`,
            'OpenAI-Organization': 'org-HJI1YmZoPHPIuQoN3vRrYSmN' // sendos EReader
          },
          body: JSON.stringify({
            model: model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }]
          })
        });
        
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        result = await response.json();
        return result.choices[0].message.content;

        // // OpenAI API call with detailed debugging
        // console.log("Making OpenAI API call with model:", model || 'gpt-3.5-turbo');
        
        // try {
        //   const requestBody = {
        //     model: model || 'gpt-3.5-turbo',
        //     messages: [{ role: 'user', content: prompt }]
        //   };
          
        //   console.log("OpenAI request payload:", JSON.stringify(requestBody));
        //   console.log("OpenAI API key length:", apiKey ? apiKey.length : 0);
          
        //   response = await fetch('https://api.openai.com/v1/chat/completions', {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //       'Authorization': `Bearer ${apiKey as string}`,
        //       'OpenAI-Organization': 'org-HJI1YmZoPHPIuQoN3vRrYSmN' // sendos EReader
        //     },
        //     body: JSON.stringify(requestBody)
        //   });
          
        //   console.log("OpenAI response status:", response.status);
        //   console.log("OpenAI response status text:", response.statusText);
          
        //   if (!response.ok) {
        //     const errorDetails = await response.text();
        //     console.error("OpenAI error details:", errorDetails);
        //     throw new Error(`OpenAI API error: ${response.status} - ${errorDetails}`);
        //   }
          
        //   result = await response.json();
        //   console.log("OpenAI response structure:", Object.keys(result));
        //   return result.choices[0].message.content;
        // } catch (openaiError) {
        //   console.error("Detailed OpenAI error:", openaiError);
        //   throw openaiError;
        // }
        // break;
        
      case 'anthropic':
        // Anthropic API call
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey as string, // Type assertion to string
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model || 'claude-3-sonnet-20240229',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000
          })
        });
        
        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`);
        }
        
        result = await response.json();
        return result.content[0].text;
        
      case 'google':
        // Google Gemini API call
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.0-pro'}:generateContent?key=${apiKey as string}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          })
        });
        
        if (!response.ok) {
          throw new Error(`Google AI API error: ${response.status}`);
        }
        
        result = await response.json();
        return result.candidates[0].content.parts[0].text;
        
      case 'ollama':
      default:
        // Default to Ollama (local)
        const ollamaUrl = ConfigService.getReaderConfig("ollamaUrl") || "http://localhost:11434";
        
        response = await fetch(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            prompt: prompt,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status}`);
        }

        result = await response.json();
        return result.response;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error with API call:`, error);
    toast.error(i18n.t("Error with AI API: ") + errorMessage);


    // sendos: 
    // // Show a more detailed error message to the user
    // let userErrorMessage = i18n.t("Failed to connect to AI API");
    // if (errorMessage.includes("401")) {
    //   userErrorMessage = i18n.t(`${provider} API authentication failed. Please check your API key.`);
    // } else if (errorMessage.includes("429")) {
    //   userErrorMessage = i18n.t(`${provider} API rate limit exceeded. Please try again later.`);
    // } else if (errorMessage.includes("400")) {
    //   userErrorMessage = i18n.t(`${provider} API request error. Model may be invalid.`);
    // }
    //toast.error(userErrorMessage);
    return null;
  }
};

// Helper function to parse model selection string
// Format: "provider:model" or just "model" (defaults to ollama)
const parseModelSelection = (modelSelection: string): [string, string] => {
  // Check if model includes provider prefix
  if (modelSelection.includes(':')) {
    const [provider, model] = modelSelection.split(':');
    return [provider, model];
  }
  
  // Special cases for specific hosted models
  if (modelSelection.startsWith('gpt-')) {
    return ['openai', modelSelection];
  } else if (modelSelection.startsWith('claude-')) {
    return ['anthropic', modelSelection];
  } else if (modelSelection.startsWith('gemini-')) {
    return ['google', modelSelection];
  }
  
  // Default to ollama
  return ['ollama', modelSelection];
};

// Helper function to get API key based on provider
const getApiKey = (provider: string): string | null => {
  let key: string | null = null;
  
  try {
    switch (provider) {
      case 'openai':
        key = ConfigService.getReaderConfig("openaiKey") || null;
        break;
      case 'anthropic':
        key = ConfigService.getReaderConfig("anthropicKey") || null;
        break;
      case 'google':
        key = ConfigService.getReaderConfig("googleKey") || null;
        break;
      default:
        return null; // No API key needed for Ollama
    }
  } catch (error) {
    console.error("Error accessing ConfigService:", error);
  }
  
  return key;
};

// Helper function to determine if provider needs an API key
const needsApiKey = (provider: string): boolean => {
  return ['openai', 'anthropic', 'google'].includes(provider);
};
export const getDictionary = async (word: string, from: string, to: string) => {
  let readerRequest = await getReaderRequest();
  let result = await readerRequest.getDictionary({ word, from, to });
  if (result.code === 200) {
    return result;
  } else if (result.code === 401) {
    handleExitApp();
    return;
  } else {
    toast.error(i18n.t("Fetch failed, error code") + ": " + result.msg);
  }
  return result;
};
export const getReaderRequest = async () => {
  if (readerRequest) {
    return readerRequest;
  }
  readerRequest = new ReaderRequest(TokenService, ConfigService);
  return readerRequest;
};
export const getDictText = async (word: string, from: string, to: string) => {
  let res = await getDictionary(word, from, to);
  if (res.code === 200 && res.data && res.data.length > 0) {
    let dictText =
      `<p class="dict-word-type">[${i18n.t("Pronunciations")}]</p></p>` +
      (res.data[0].pronunciation ? res.data[0].pronunciation : "") +
      (res.data[0].audio &&
        `<div class="audio-container"><audio controls class="audio-player" controlsList="nodownload noplaybackrate"><source src="${res.data[0].audio}" type="audio/mpeg"></audio></div>`) +
      res.data[0].meaning
        .map((item) => {
          return (
            (item.type && `<p><p class="dict-word-type">[${item.type}]</p>`) +
            `<div  style="font-weight: bold">${
              item.definition
            }</div><div>${item.examples
              .map((item) => {
                return `<p>${item.sentence}</p>` + `<p>${item.translation}</p>`;
              })
              .join("</div><div>")}</div></p>`
          );
        })
        .join("") +
      `<p class="dict-learn-more">${i18n.t("Generated with AI")}</p>`;
    return dictText;
  } else {
    toast.error(i18n.t("No result found"));
    return "";
  }
};
