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
  model: string = "gemma3:27b"
) => {
  try {
    // Default to localhost Ollama endpoint
    const ollamaUrl = ConfigService.getReaderConfig("ollamaUrl") || "http://localhost:11434";
    
    const response = await fetch(`${ollamaUrl}/api/generate`, {
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

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error with Ollama API:", error);
    toast.error(i18n.t("Failed to connect to Ollama API"));
    return null;
  }
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
