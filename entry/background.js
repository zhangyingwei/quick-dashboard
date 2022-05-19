console.log('hello world background todo something~')
import IndexedDbKits from "../utils/IndexedDbKits"
import Logger from "../utils/Logger"

const BackgroundBoard = {
  init: function () {
    this.events()
    Logger.debug('init background board~')
  },
  events() {
    chrome.bookmarks.onCreated.addListener(function (id, bookmark) {
      Logger.debug("create bookmark", id, bookmark)
      Logger.debug(this);
      if (bookmark.url) {
        IndexedDbKits.writeNewBookmarkCache(bookmark)
      }  
    })
    Logger.debug("listening to bookmark create event")

    chrome.bookmarks.onRemoved.addListener(function (id, bookmark) {
      Logger.debug("remove bookmark", id, bookmark.node)
      Logger.debug(this)
      IndexedDbKits.removeNewBookmarkCache(bookmark.node)
      IndexedDbKits.removeTagsByItemId(bookmark.node.id)
    })
    Logger.debug("listening to bookmark remove event")
  },
  notifyBoard: {
    listeners: {},
    addListener(key,listener) {
      this.listeners[key] = listener
    },
    notice(key,data) {
      if (this.listeners[key]) {
        this.listeners[key](data)
      }
    }
  }
}

BackgroundBoard.init();