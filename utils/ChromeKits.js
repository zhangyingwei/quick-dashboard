import IndexedDbKits from "./IndexedDbKits"
import Logger from "./Logger";

const chromeKits = {
  hello() {
    console.log('Hello from ChromeKits');
  },
  getTotalIds(sort) {
    var bookmarkIds = [];
    var dirIds = [];
    if (sort != "desc" && sort != "asc") {
      console.error("sort must be desc or asc");
      return;
    }
    const sortFunc = sort === "asc" ? (l,r) => l-r : (l,r) => r-l;
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getTree().then(tree => {
        this._explanTree(tree, bookmarkIds, dirIds);
        // console.log('explan result:', bookmarkIds, dirIds,new Date().getTime());
        bookmarkIds = bookmarkIds.map(id => parseInt(id)).sort(sortFunc)
        dirIds = dirIds.map(id => parseInt(id)).sort(sortFunc)
        resolve({bookmarkIds,dirIds});
      }).catch(err => {
        reject(err);
      });
    })
  },
  getBookmarksWithPage(pageNum,pageSize,sort="desc") {
    const pageStart = (pageNum - 1) * pageSize;
    const pageEnd = pageNum * pageSize;
    return new Promise((resolve, reject) => {
      this.getTotalIds(sort).then(res => res.bookmarkIds).then(ids => {
        const idsInPage = ids.slice(pageStart, pageEnd).map(id => id+"");
        chrome.bookmarks.get(idsInPage).then(res => {
          const getTagPromises = res.map(item => IndexedDbKits.queryItemTags(item));
          Promise.all(getTagPromises).then(() => {
            resolve(res);
          }).catch(err => {
            reject(err);
          });
        }).catch(err => {
          reject(err);
        });
      }).catch(err => {
        reject(err);
      })
    })
  },
  getAllBookmarksWithTag(sort="desc") {
    return new Promise((resolve, reject) => {
      this.getTotalIds(sort).then(res => res.bookmarkIds).then(ids => {
        Logger.debug('ids', ids);
        chrome.bookmarks.get([...ids.map(id => id+'')]).then(res => {
          const getTagPromises = res.map(item => IndexedDbKits.queryItemTags(item));
          Promise.all(getTagPromises).then(() => {
            resolve(res);
          }).catch(err => {
            reject(err);
          });
        }).catch(err => {
          reject(err);
        });
      }).catch(err => {
        reject(err);
      })
    })
  },
  searchBookmarks(keywords) {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.search(keywords).then(res => {
        const whtiOutDirRes = res.filter(item => item.url);
        const getTagPromises = whtiOutDirRes.filter(item => item.url != undefined).map(item => IndexedDbKits.queryItemTags(item));
        Promise.all(getTagPromises).then(() => {
          resolve(whtiOutDirRes);
        }).catch(err => {
          reject(err);
        });
      }).catch(err => {
        reject(err);
      });
    })
  },
  getAllDirs(sort="desc") {
    return new Promise((resolve, reject) => {
      this.getTotalIds(sort).then(res => res.dirIds).then(ids => {
        chrome.bookmarks.get(ids.map(rr => rr+"")).then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        });
      }).catch(err => {
        reject(err);
      })
    })
  },
  getDirsWithPage(pageNum,pageSize,sort="desc") {
    const pageStart = (pageNum - 1) * pageSize;
    const pageEnd = pageNum * pageSize;
    return new Promise((resolve, reject) => {
      this.getTotalIds(sort).then(res => res.dirIds).then(ids => {
        const idsInPage = ids.slice(pageStart, pageEnd).map(id => id+"");
        chrome.bookmarks.get(idsInPage).then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        });
      }).catch(err => {
        reject(err);
      })
    })
  },
  getBookmarksWithTag(tag) {
    return new Promise((resolve, reject) => {
      IndexedDbKits.listTagItems(tag).then(tags => {
        Logger.debug('tags:', tags);
        const bookmarkIds = tags.map(item => item.itemId)
        if (!bookmarkIds || bookmarkIds.length == 0) {
          resolve([]);
          return;
        }
        chrome.bookmarks.get(bookmarkIds).then(res => {
          const getTagPromises = res.map(item => IndexedDbKits.queryItemTags(item))
          Promise.all(getTagPromises).then(() => {
            resolve(res);
          }).catch(err => {
            reject(err);
          });
        }).catch(err => {
          Logger.error('getBookmarksWithTag error:', err);
          resolve([]);
        });
      }).catch(err => {
        reject(err);
      });
    })
  },
  async getById (id){
    return await chrome.bookmarks.get([id+""]);
  },
  _explanTree(tree,bookmarkIds,dirIds) {
    if(!tree) {
      return;
    }
    tree.forEach(item => {
      if (item.url) {
        bookmarkIds.push(item.id);
      } else {
        dirIds.push(item.id);
        this._explanTree(item.children,bookmarkIds,dirIds);
      }
    });
  }
};

export default chromeKits;