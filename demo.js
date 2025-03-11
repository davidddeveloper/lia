document.addEventListener("DOMContentLoaded", () => {
  // Demo tabs functionality
  const tabs = document.querySelectorAll(".demo-tab")
  const contents = document.querySelectorAll(".demo-content")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab")

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")

      // Update active content
      contents.forEach((content) => {
        content.classList.remove("active")
        if (content.id === target) {
          content.classList.add("active")
        }
      })
    })
  })

  // FAQ accordion functionality
  const faqItems = document.querySelectorAll(".faq-item")

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")

    question.addEventListener("click", () => {
      item.classList.toggle("active")
    })
  })

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()

      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth",
        })
      }
    })
  })

  // Demo buttons functionality
  const aiButtons = document.querySelectorAll(".linkedin-ai-button")
  const dismissButtons = document.querySelectorAll(".linkedin-ai-dismiss")
  const regenerateButtons = document.querySelectorAll(".linkedin-ai-regenerate")
  const improveButton = document.querySelector(".linkedin-ai-improve-button")

  // For demo purposes, we'll just toggle the visibility of suggestions
  aiButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const suggestions = this.nextElementSibling
      if (suggestions && suggestions.classList.contains("linkedin-ai-suggestions")) {
        suggestions.style.display = suggestions.style.display === "none" ? "block" : "none"
      }
    })
  })

  dismissButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const suggestions = this.closest(".linkedin-ai-suggestions")
      if (suggestions) {
        suggestions.style.display = "none"
      }
    })
  })

  regenerateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // In a real extension, this would generate new suggestions
      alert("In a real extension, this would generate new AI suggestions.")
    })
  })

  if (improveButton) {
    improveButton.addEventListener("click", function () {
      const suggestions = this.closest(".linkedin-post").querySelector(".linkedin-ai-suggestions")
      if (suggestions) {
        suggestions.style.display = suggestions.style.display === "none" ? "block" : "none"
      }
    })
  }

  // Download button functionality
  const downloadButtons = document.querySelectorAll(".cta-button")

  downloadButtons.forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = "installation-guide.html"
    })
  })
})

