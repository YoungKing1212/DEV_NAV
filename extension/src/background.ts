type BookmarkMessage = {
  type: 'GET_BOOKMARKS' | 'BOOKMARKS_CHANGED' | 'PING';
  data?: chrome.bookmarks.BookmarkTreeNode[];
};

// 存储允许的源
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost'
];

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
    await chrome.runtime.sendMessage('chnkkjkkjhpocggimaakdkomgejjdajf', {
      type: 'BOOKMARKS_CHANGED',
      data: bookmarks
    });
  } catch (error) {
    console.error('同步失败:', error);
  }
}

// 监听来自前端的消息
chrome.runtime.onMessageExternal.addListener((
  request: BookmarkMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  // 检查消息来源
  if (!sender.origin || !ALLOWED_ORIGINS.some(origin => sender.origin?.startsWith(origin))) {
    console.error('Unauthorized message origin:', sender.origin);
    return;
  }

  // 处理 PING 消息
  if (request.type === 'PING') {
    sendResponse({ success: true });
    return true; // 保持消息通道开启
  }
  
  if (request.type === 'GET_BOOKMARKS') {
    chrome.bookmarks.getTree().then(bookmarks => {
      sendResponse({ bookmarks });
    });
    return true; // 保持消息通道开启
  }
}); 