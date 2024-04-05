import { currentRunId } from "../client.js"
const comInput = document.getElementById("comInput")
const commentsSec = document.getElementById("commentsSec")

export async function showComments(runId) {
  const response = await fetch(`/comments?runId=${runId}`)
  const comments = await response.json()
  commentsSec.innerHTML = ""

  // Sort comments by time from newest to oldest
  comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  comments.forEach((comment) => {
    const commentDiv = document.createElement("div")
    commentDiv.className = "comment-container"

    const usernameSpan = document.createElement("span")
    usernameSpan.className = "comment-username"
    usernameSpan.textContent = `${comment.username}: `

    const contentSpan = document.createElement("span")
    contentSpan.className = "comment-content"
    contentSpan.textContent = comment.content

    const timestampDiv = document.createElement("div")
    timestampDiv.className = "comment-timestamp"
    const date = new Date(comment.createdAt).toLocaleString()
    timestampDiv.textContent = `(${date})`

    commentDiv.appendChild(usernameSpan)
    commentDiv.appendChild(contentSpan)
    commentDiv.appendChild(timestampDiv)
    commentsSec.appendChild(commentDiv)
  })
}

export const handleCommentSubmit = async () => {
  const username = sessionStorage.getItem("username")

  const commentText = comInput.value
  if (!commentText.trim()) {
    alert("Cannot Submit Empty Comment!")
    return
  }
  // If the comment text, current run activity ID (currentRunId) and user name all exist, the internal code is executed.
  if (commentText && currentRunId && username) {
    const response = await fetch("/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: commentText,
        runId: currentRunId,
        username,
      }),
    })
    if (response.ok) {
      comInput.value = ""
      showComments(currentRunId) // Re-fetch and display all comments
    }
  }
}
