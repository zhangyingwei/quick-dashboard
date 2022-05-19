import Logger from "./Logger";

import Dexie from "dexie";

const IndexedDbKits = {
  dbName: "BookmarkDashboardDb",
  dbVersion: 2.3,
  _dbInstance: null,
  _openDb() {
    if (this._dbInstance) {
      return this._dbInstance;
    }

    this._dbInstance = new Dexie(this.dbName);
    this._dbInstance.version(this.dbVersion).stores({
      tagTable: "++id, *itemId, *tag",
      navTable: "++id, *title,*category,*roundType,*url",
    });
    return this._dbInstance;
  },
  insertNewTag(itemId, tag) {
    return this._openDb().tagTable.put({
      itemId: itemId,
      tag: tag,
    })
  },
  removeTagsByItemId(itemId) {
    return this._openDb().tagTable.where("itemId").equals(itemId).delete();
  },
  removeTagByItemId(itemId, tag) {
    return this._openDb().tagTable.where("itemId").equals(itemId).and(function (item) {
      return item.tag === tag;
    }).delete();
  },
  queryItemTags(item) {
    const itemId = item.id;
    return new Promise((resolve, reject) => {
      this._openDb().tagTable.where("itemId").equals(itemId).toArray().then((tags) => {
        if (tags && tags.length > 0) {
          item.tags = tags.map((tag) => tag.tag);
          resolve(item);
        } else {
          Logger.warn("itemId not exist", itemId);
          resolve(item);
        }
      }).catch((err) => {
        Logger.error(err);
        reject(err);
      });
    });
  },
  listTagItems(tag) {
    return this._openDb().tagTable.where("tag").equals(tag).toArray();
  },
  listAllTags() {
    return this._openDb().tagTable.toArray();
  },
  listAllNavigations() {
    return this._openDb().navTable.toArray();
  },
  updateNavigationById(id, data) {
    return this._openDb().navTable.update(id, data);
  },
  listNacigationsByUrl(url) {
    return this._openDb().navTable.where("url").equals(url).toArray();
  },
  insertNewNavigation(nav) {
    return this._openDb().navTable.put(nav);
  },
  listAllNavs() {
    return this._openDb().navTable.toArray();  
  },
  deleteNavById(id) {
    return this._openDb().navTable.where("id").equals(id).delete();
  },
  writeNewBookmarkCache(bookmarkItem) {
    this.readNewBookmarksCache("newBookmarkList").then((bookmarks) => {
      var cacheList = [];
      if (bookmarks && bookmarks.newBookmarkList && bookmarks.newBookmarkList.list) {
        const found = bookmarks.newBookmarkList.list.find((item) => item.title === bookmarkItem.title);
        if (!found || found.length === 0) {
          cacheList = [...bookmarks.newBookmarkList.list, bookmarkItem];
        }
      } else {
        cacheList = [bookmarkItem];
      }
      chrome.storage.local.set({
        "newBookmarkList": {list: cacheList}
      }, function () {
        Logger.debug("write new bookmark cache success", bookmarkItem);
      });
    });
  },
  removeNewBookmarkCache(bookmarkItem) {
    return new Promise((resolve, reject) => {
      this.readNewBookmarksCache("newBookmarkList").then((bookmarks) => {
        var cacheList = [];
        if (bookmarks.newBookmarkList.list) {
          cacheList = bookmarks.newBookmarkList.list.filter((item) => item.id !== bookmarkItem.id);
        }
        chrome.storage.local.set({
          "newBookmarkList": {list: cacheList}
        }, function () {
          Logger.debug("remove new bookmark cache success", cacheList);
          resolve()
        });
      }).catch((err) => {
        Logger.error(err);
        reject(err);
      });
    })
  },
  readNewBookmarksCache(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], function (items) {
        Logger.debug("read new bookmark cache success", items);
        resolve(items);
      });
    });
  },
}


export default IndexedDbKits;