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
    container.innerHTML = "";

    const start = currentPage*POSTS_PER_PAGE;
    const pagePosts = posts.slice(start, start+POSTS_PER_PAGE);

    pagePosts.forEach(post=>{
      container.innerHTML += `
        <article class="post">
          <h2>${post.title}</h2>
          <p class="date">${post.date}</p>
          <p>${post.content.substring(0,200)}...</p>
          <a href="post.html?slug=${post.slug}">Read more →</a>
        </article>
      `;
    });

    document.getElementById("newer").disabled = currentPage === 0;
    document.getElementById("older").disabled = start + POSTS_PER_PAGE >= posts.length;
  }

  document.getElementById("older").onclick = ()=>{
    currentPage++;
    render();
  }

  document.getElementById("newer").onclick = ()=>{
    if(currentPage>0){
      currentPage--;
      render();
    }
  }

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
    container.innerHTML = "Post not found.";
    return;
  }

  container.innerHTML = `
    <h1>${post.title}</h1>
    <p class="date">${post.date}</p>
    <div>${marked.parse(post.content)}</div>
  `;
}

// --- Admin Panel ---
async function initAdmin(){
  if(localStorage.getItem("isAdmin")!=="true"){
    window.location.href="login.html";
    return;
  }

  const form = document.getElementById("post-form");
  const posts = await getPosts();

  form.addEventListener("submit", e=>{
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    const newPost = {
      title,
      slug: createSlug(title),
      date: new Date().toISOString().split("T")[0],
      content
    };

    posts.unshift(newPost);
    savePosts(posts);
    window.location.href="index.html";
  });

  const logoutBtn = document.getElementById("logout");
  if(logoutBtn){
    logoutBtn.onclick = ()=>{
      localStorage.removeItem("isAdmin");
      window.location.href="index.html";
    }
  }
}

// --- Auto init ---
if(document.getElementById("posts")) renderHome();
if(document.getElementById("post-form")) initAdmin();
if(document.getElementById("single-post")) loadSinglePost();
