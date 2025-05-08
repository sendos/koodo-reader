import React from "react";
import "./popupOption.css";

import Note from "../../../models/Note";
import { PopupOptionProps } from "./interface";
import ColorOption from "../../colorOption";
import { popupList } from "../../../constants/popupList";
import { ConfigService } from "../../../assets/lib/kookit-extra-browser.min";
import toast from "react-hot-toast";
import { getSelection } from "../../../utils/reader/mouseEvent";
import copy from "copy-text-to-clipboard";
import { getIframeDoc } from "../../../utils/reader/docUtil";
import { openExternalUrl } from "../../../utils/common";
import DatabaseService from "../../../utils/storage/databaseService";

declare var window: any;

class PopupOption extends React.Component<PopupOptionProps> {
  handleNote = () => {
    // this.props.handleChangeDirection(false);
    this.props.handleMenuMode("note");
  };
  handleCopy = async () => {
    let text = await getSelection();
    if (!text) return;
    copy(text);
    this.props.handleOpenMenu(false);
    let doc = getIframeDoc();
    if (!doc) return;
    doc.getSelection()?.empty();
    toast.success(this.props.t("Copying successful"));
  };
  handleTrans = async () => {
    this.props.handleMenuMode("trans");
    const text = await getSelection();
    this.props.handleOriginalText(text || "");
  };
  handleDict = async () => {
    this.props.handleMenuMode("dict");
    const text = await getSelection();
    this.props.handleOriginalText(text || "");
  };
  handleDigest = async () => {
    if (
      ConfigService.getReaderConfig("pdfReaderMode") === "double" &&
      this.props.currentBook.format === "PDF"
    ) {
      toast.error(
        this.props.t(
          "PDF files in double page mode does not support note taking yet"
        )
      );
      return;
    }
    let bookKey = this.props.currentBook.key;
    let cfi = JSON.stringify(
      ConfigService.getObjectConfig(
        this.props.currentBook.key,
        "recordLocation",
        {}
      )
    );

    let percentage = ConfigService.getObjectConfig(
      this.props.currentBook.key,
      "recordLocation",
      {}
    ).percentage
      ? ConfigService.getObjectConfig(
          this.props.currentBook.key,
          "recordLocation",
          {}
        ).percentage
      : "0";
    let color = this.props.color;
    let notes = "";
    let pageArea = document.getElementById("page-area");
    if (!pageArea) return;
    let iframe = pageArea.getElementsByTagName("iframe")[0];
    if (!iframe) return;
    let doc = getIframeDoc();
    if (!doc) return;
    let range = JSON.stringify(
      await this.props.htmlBook.rendition.getHightlightCoords(
        this.props.chapterDocIndex
      )
    );

    let text = doc.getSelection()?.toString();
    if (!text) return;
    text = text.replace(/\s\s/g, "");
    text = text.replace(/\r/g, "");
    text = text.replace(/\n/g, "");
    text = text.replace(/\t/g, "");
    text = text.replace(/\f/g, "");
    let digest = new Note(
      bookKey,
      this.props.chapter,
      this.props.chapterDocIndex,
      text,
      cfi,
      range,
      notes,
      percentage,
      color,
      []
    );
    DatabaseService.saveRecord(digest, "notes").then(async () => {
      this.props.handleOpenMenu(false);
      toast.success(this.props.t("Addition successful"));
      this.props.handleFetchNotes();
      this.props.handleMenuMode("");
      await this.props.htmlBook.rendition.createOneNote(
        digest,
        this.handleNoteClick
      );
    });
  };

  handleNoteClick = (event: Event) => {
    this.props.handleNoteKey((event.target as any).dataset.key);
    this.props.handleMenuMode("note");
    this.props.handleOpenMenu(true);
  };
  handleJump = (url: string) => {
    openExternalUrl(url);
  };
  handleSearchInternet = async () => {
    const text = await getSelection();
    
    switch (ConfigService.getReaderConfig("searchEngine")) {
      case "google":
        this.handleJump("https://www.google.com/search?q=" + text);
        break;
      case "baidu":
        this.handleJump("https://www.baidu.com/s?wd=" + text);
        break;
      case "bing":
        this.handleJump("https://www.bing.com/search?q=" + text);
        break;
      case "duckduckgo":
        this.handleJump("https://duckduckgo.com/?q=" + text);
        break;
      case "yandex":
        this.handleJump("https://yandex.com/search/?text=" + text);
        break;
      case "yahoo":
        this.handleJump("https://search.yahoo.com/search?p=" + text);
        break;
      case "naver":
        this.handleJump(
          "https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=1&ie=utf8&query=" + text
        );
        break;
      case "baike":
        this.handleJump("https://baike.baidu.com/item/" + text);
        break;
      case "wiki":
        this.handleJump("https://en.wikipedia.org/wiki/" + text);
        break;
      default:
        this.handleJump(
          navigator.language === "zh-CN"
            ? "https://www.baidu.com/s?wd=" + text
            : "https://www.google.com/search?q=" + text
        );
        break;
    }
  };
  handleSearchBook = async () => {
    let leftPanel = document.querySelector(".left-panel");
    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    if (!leftPanel) return;
    leftPanel.dispatchEvent(clickEvent);
    const focusEvent = new MouseEvent("focus", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    let searchBox: any = document.querySelector(".header-search-box");
    searchBox.dispatchEvent(focusEvent);
    let searchIcon = document.querySelector(".header-search-icon");
    searchIcon?.dispatchEvent(clickEvent);
    
    const text = await getSelection();
    searchBox.value = text || "";
    
    const keyEvent: any = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      keyCode: 13,
    } as any);
    searchBox.dispatchEvent(keyEvent);
    this.props.handleOpenMenu(false);
  };

  handleFictionChat = async () => {
    this.props.handleMenuMode("fictionchat");
    const text = await getSelection();
    this.props.handleOriginalText(text || "");
  };

  handleSpeak = async () => {
    var msg = new SpeechSynthesisUtterance();
    const text = await getSelection();
    msg.text = text || "";
    if (window.speechSynthesis && window.speechSynthesis.getVoices) {
      msg.voice = window.speechSynthesis.getVoices()[0];
      window.speechSynthesis.speak(msg);
    }
  };



  render() {
    const PopupProps = {
      handleDigest: this.handleDigest,
    };
    const renderMenuList = () => {
      return (
        <>
          <div className="menu-list">
            {popupList.map((item, index) => {
              return (
                <div
                  key={item.name}
                  className={item.name + "-option"}
                  onClick={() => {
                    switch (item.name) {
                      case "note":
                        this.handleNote();
                        break;
                      case "digest":
                        this.handleDigest();
                        break;
                      case "translation":
                        this.handleTrans();
                        break;
                      case "copy":
                        this.handleCopy();
                        break;
                      case "search-book":
                        this.handleSearchBook();
                        break;
                      case "fictionchat":
                        this.handleFictionChat();
                        break;
                      case "dict":
                        this.handleDict();
                        break;
                      case "browser":
                        this.handleSearchInternet();
                        break;
                      case "speaker":
                        this.handleSpeak();
                        break;
                      default:
                        break;
                    }
                  }}
                >
                  <span
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={this.props.t(item.title)}
                  >
                    <span
                      className={`icon-${item.icon} ${item.name}-icon`}
                    ></span>
                  </span>
                </div>
              );
            })}
          </div>
          <ColorOption {...PopupProps} />
        </>
      );
    };
    return renderMenuList();
  }
}

export default PopupOption;
