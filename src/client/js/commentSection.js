const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const comments = document.querySelectorAll(".video__comment");

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = ` ${text}`;
    const span2 = document.createElement("span");
    span2.innerText = "❌";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
  };


const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

const handleCommentDelete=async(e)=>{
    const div = e.target.parentElement;
    const comment = div.parentElement;
    const videoId = videoContainer.dataset.id;
    const commentId = comment.dataset.id;

    const response = await fetch(`/api/videos/${videoId}/comment/${commentId}`,{
        method:"DELETE",
        headers:{
            "Content-Type" : "application/json"
        },
    });
    if(response.status === 200){
        e.target.removeEventListener("click", handleCommentDelete);
        comment.remove();
    }

}

comments.forEach((e)=>{
    const deletBtn = e.querySelector("span i");
    if(deletBtn){
        e.querySelector("span i").addEventListener("click", handleCommentDelete);
    }
})


if (form) {
  form.addEventListener("submit", handleSubmit);
}
