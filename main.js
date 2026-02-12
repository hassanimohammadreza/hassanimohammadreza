const POSTS_PER_PAGE = 5;

async function getPosts() {
  const local = localStorage.getItem("posts");
  let posts;

  if(local){
    posts = JSON.parse(local);
  } else {
    const res = await fetch("posts.json");
    posts = await res.json();
  }

  posts.sort((a,b) => new Date(b.date) - new Date(a.date));
  return posts;
}

function savePosts(posts){
  localStorage.setItem("posts", JSON.stringify(posts));
}

function createSlug(title){
  return title.toLowerCase().replace(/\s+/g,"-");
}

// --- Home Page ---
async function renderHome(){
  const posts = await getPosts();
  let currentPage = 0;

  function render(){
    const container = document.getElementById("posts");
    container.textContent = ""; 

    const start = currentPage * POSTS_PER_PAGE;
    const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

    const fragment = document.createDocumentFragment();

    pagePosts.forEach(post => {

      const article = document.createElement("article");
      article.className = "post";

      // Title
      const title = document.createElement("h2");
      title.textContent = post.title;

      // Date
      const date = document.createElement("p");
      date.className = "date";
      date.textContent = post.date;

      // Excerpt
      const excerpt = document.createElement("p");
      excerpt.textContent = post.content.substring(0, 200) + "...";

      // Link
      const link = document.createElement("a");
      link.href = `post.html?slug=${post.slug}`;
      link.textContent = "Read more →";

      // Append elements
      article.appendChild(title);
      article.appendChild(date);
      article.appendChild(excerpt);
      article.appendChild(link);

      fragment.appendChild(article);
    });

    container.appendChild(fragment);

    // Pagination buttons
    document.getElementById("newer").disabled = currentPage === 0;
    document.getElementById("older").disabled =
      start + POSTS_PER_PAGE >= posts.length;
  }

  document.getElementById("older").onclick = () => {
    currentPage++;
    render();
  };

  document.getElementById("newer").onclick = () => {
    if(currentPage > 0){
      currentPage--;
      render();
    }
  };

  render();
}

// --- Single Post Page ---
async function loadSinglePost(){
  const posts = await getPosts();
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const container = document.getElementById("single-post");

  const post = posts.find(p=>p.slug === slug);
  if(!post){
    container.textContent = "Post not found.";
    return;
  }

  container.textContent = "";

  const title = document.createElement("h1");
  title.textContent = post.title;

  const date = document.createElement("p");
  date.className = "date";
  date.textContent = post.date;

  const contentDiv = document.createElement("div");
  contentDiv.innerHTML = marked.parse(post.content);

  container.appendChild(title);
  container.appendChild(date);
  container.appendChild(contentDiv);

}

// --- Auto init ---
if(document.getElementById("posts")) renderHome();
if(document.getElementById("single-post")) loadSinglePost();
