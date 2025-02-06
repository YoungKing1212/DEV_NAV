type BookmarkMessage = {
  type: 'GET_BOOKMARKS' | 'BOOKMARKS_CHANGED';
  data?: chrome.bookmarks.BookmarkTreeNode[];
};

// 监听书签变化
chrome.bookmarks.onCreated.addListener(handleBookmarkChange);
chrome.bookmarks.onRemoved.addListener(handleBookmarkChange);
chrome.bookmarks.onChanged.addListener(handleBookmarkChange);
chrome.bookmarks.onMoved.addListener(handleBookmarkChange);

// 处理书签变化
async function handleBookmarkChange(): Promise<void> {
  try {
    const bookmarks = await chrome.bookmarks.getTree();
    // 通过消息传递给前端应用
    await chrome.runtime.sendMessage({
      type: 'BOOKMARKS_CHANGED',
      data: bookmarks
    });
  } catch (error) {
    console.error('同步失败:', error);
  }
}

// 监听来自前端的消息
chrome.runtime.onMessage.addListener((
  request: BookmarkMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: { bookmarks: chrome.bookmarks.BookmarkTreeNode[] }) => void
) => {
  if (request.type === 'GET_BOOKMARKS') {
    chrome.bookmarks.getTree().then(bookmarks => {
      sendResponse({ bookmarks });
    });
    return true; // 保持消息通道开启
  }
}); 