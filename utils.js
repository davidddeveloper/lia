function safeJSONParse(str, fallback = {}) {
  try {
    return JSON.parse(str)
  } catch (e) {
    console.error("Error parsing JSON:", e)
    return fallback
  }
}

// Function to debounce function calls
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Function to sanitize HTML to prevent XSS
function sanitizeHTML(text) {
  const element = document.createElement("div")
  element.textContent = text
  return element.innerHTML
}

// Function to format text with markdown-like syntax
function formatText(text) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Italic
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>")

  // Links
  text = text.replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" target="_blank">$1</a>')

  // Hashtags
  text = text.replace(/(^|\s)(#[a-zA-Z0-9_]+)/g, '$1<span style="color: #0a66c2;">$2</span>')

  // Mentions
  text = text.replace(/(^|\s)(@[a-zA-Z0-9_]+)/g, '$1<span style="color: #0a66c2;">$2</span>')

  // Line breaks
  text = text.replace(/\n/g, "<br>")

  return text
}

// Function to detect the current LinkedIn page type
function detectPageType() {
  const url = window.location.href

  if (url.includes("linkedin.com/feed")) {
    return "feed"
  } else if (url.includes("linkedin.com/in/")) {
    return "profile"
  } else if (url.includes("linkedin.com/company/")) {
    return "company"
  } else if (url.includes("linkedin.com/jobs/")) {
    return "jobs"
  } else if (url.includes("linkedin.com/messaging/")) {
    return "messaging"
  } else if (url.includes("linkedin.com/notifications/")) {
    return "notifications"
  } else if (url.includes("linkedin.com/mynetwork/")) {
    return "network"
  } else {
    return "other"
  }
}

// Function to get user information
function getCurrentUserInfo() {
  // This is a simplified implementation
  // In a real extension, you'd want to use LinkedIn's API or parse the DOM more carefully
  const userInfo = {
    name: "",
    headline: "",
    profileUrl: "",
  }

  // Try to get user name from the nav bar
  const navProfileName =
    document.querySelector(".global-nav__me-photo") || document.querySelector(".feed-identity-module__member-photo")

  if (navProfileName) {
    const altText = navProfileName.getAttribute("alt")
    if (altText) {
      userInfo.name = altText.replace("'s profile photo", "").trim()
    }
  }

  // Try to get headline from profile card
  const headline = document.querySelector(".feed-identity-module__headline")
  if (headline) {
    userInfo.headline = headline.textContent.trim()
  }

  // Try to get profile URL
  const profileLink = document.querySelector(".feed-identity-module__member-photo-container a")
  if (profileLink) {
    userInfo.profileUrl = profileLink.getAttribute("href")
  }

  return userInfo
}

// Export utilities
window.utils = {
  safeJSONParse,
  debounce,
  sanitizeHTML,
  formatText,
  detectPageType,
  getCurrentUserInfo,
}

