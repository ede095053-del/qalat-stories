// ===== STATE =====
// Apply saved theme immediately (before render to avoid flash)
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  document.documentElement.classList.add('dark');
}

const API = '';
let stories = [];
let currentStoryId = null;
let currentChapterIndex = 0;
let myStoryIds = [];
let coverPhotoData = null;
let chapterImageDatas = [];
let currentUser = null;
let authToken = localStorage.getItem('qalat_token') || null;

// ===== API HELPER =====
async function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
  try {
    const res = await fetch(API + url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    return await res.json();
  } catch (e) {
    return { error: 'Network error' };
  }
}

// ===== AUTH FUNCTIONS =====
function showAuthModal() {
  const m = document.getElementById('authModal');
  m.classList.remove('hidden');
  m.style.display = 'flex';
}
function hideAuthModal() {
  const m = document.getElementById('authModal');
  m.classList.add('hidden');
  m.style.display = 'none';
}
function switchAuthTab(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
  document.getElementById('loginError').textContent = '';
  document.getElementById('signupError').textContent = '';
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';
  if (!email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }
  const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (data.error) { errEl.textContent = data.error; return; }
  authToken = data.token;
  currentUser = data.user;
  localStorage.setItem('qalat_token', authToken);
  updateNavAuth();
  hideAuthModal();
  showToast('👋 Welcome back, ' + currentUser.username + '!');
  renderHome();
}

async function doSignup() {
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const errEl = document.getElementById('signupError');
  errEl.textContent = '';
  if (!username || !email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
  const data = await apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ username, email, password }) });
  if (data.error) { errEl.textContent = data.error; return; }
  authToken = data.token;
  currentUser = data.user;
  localStorage.setItem('qalat_token', authToken);
  updateNavAuth();
  hideAuthModal();
  showToast('🎉 Welcome to ቃላት, ' + currentUser.username + '!');
  renderHome();
}

function doLogout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('qalat_token');
  myStoryIds = [];
  updateNavAuth();
  showToast('👋 Logged out.');
  showPage('home');
}

function updateNavAuth() {
  const navUser = document.getElementById('navUser');
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navUsername = document.getElementById('navUsername');
  if (currentUser) {
    navUser.style.display = 'flex';
    navLoginBtn.style.display = 'none';
    navUsername.textContent = '👤 ' + currentUser.username;
    document.getElementById('profileName').textContent = currentUser.username;
  } else {
    navUser.style.display = 'none';
    navLoginBtn.style.display = 'inline-flex';
  }
}

async function restoreSession() {
  if (!authToken) return;
  const data = await apiFetch('/api/auth/me');
  if (data.error) {
    authToken = null;
    localStorage.removeItem('qalat_token');
    return;
  }
  currentUser = data;
  updateNavAuth();
}

// ===== SAMPLE DATA =====
function loadSampleStories() {
  stories = [
    {
      id: 1,
      title: 'የፍቅር ጥላ',
      author: 'Selam Tadesse',
      genre: 'Romance',
      language: 'Amharic',
      description: 'A young woman from Addis Ababa discovers a hidden love letter from the 1960s that changes her understanding of her family forever.',
      emoji: '🌹',
      color: '#8B1A1A',
      coverPhoto: null,
      reads: 12400,
      likes: 980,
      trending: true,
      createdAt: Date.now() - 86400000 * 5,
      chapters: [
        {
          title: 'Chapter 1: The Old House',
          images: [],
          content: 'The rain fell softly on the cobblestones of Piazza as Meron pushed open the creaking door of her grandmother\'s house for the last time.\n\nThe smell of incense and old wood greeted her — a smell she had known since childhood, one that meant safety, warmth, and stories told by firelight.\n\nShe had come to pack away the last of her grandmother\'s belongings. The old woman had passed three weeks ago, quietly, in her sleep.\n\nOn the shelf above the fireplace, the familiar row of photographs stared back at her. One she had never noticed before — a young man, handsome, smiling at someone just outside the frame.\n\nOn the back, in her grandmother\'s careful handwriting: Dawit. 1963. Do not forget.\n\nMeron had never heard that name in her life.'
        },
        {
          title: 'Chapter 2: The Letter',
          images: [],
          content: 'She found the letter tucked inside the lining of an old leather suitcase, the kind that had brass clasps and smelled of cedar.\n\nThe envelope was yellowed, the ink faded to a soft brown, but the words were still legible.\n\n"My dearest Yeshi,\n\nI write this knowing you may never read it. The times are uncertain and I do not know where I will be sent. But I need you to know — whatever happens, whatever they say about me — I loved you. I love you still.\n\nKeep the blue scarf. Remember the eucalyptus tree. Remember me.\n\nYours always, Dawit"\n\nMeron sat down slowly on the dusty floor, the letter trembling in her hands.\n\nHer grandmother had kept a secret for sixty years.'
        }
      ],
      comments: [
        { name: 'Hana', text: 'This story made me cry! So beautiful 😭' },
        { name: 'Biruk', text: 'I need more chapters please!' }
      ]
    },
    {
      id: 2,
      title: 'Oromiyaa Koo',
      author: 'Chaltu Bekele',
      genre: 'History',
      language: 'Afaan Oromo',
      description: 'The epic journey of a young Oromo warrior who must choose between loyalty to his clan and the woman he loves during a time of great change.',
      emoji: '⚔️',
      color: '#1A4A1A',
      coverPhoto: null,
      reads: 8900,
      likes: 720,
      trending: true,
      createdAt: Date.now() - 86400000 * 3,
      chapters: [
        {
          title: 'Boqonnaa 1: Laga Guddaa',
          images: [],
          content: 'Guyyaan sun ho\'aa ture. Aduu galgalaa laga guddaa irratti dhiita\'aa, bishaanin dhadhaa fakkaata.\n\nGabriel — maqaan isaa Garbii ture — laga cinaa dhaabatee, harkisaa isaa keessa qabatee, yaada keessa kufee ture.\n\nBoru waraana ture. Inni beeka. Maatiin isaa beeka. Gosa hunduu beeka.\n\nGaruu inni yaadu kan biraa ture — intala mana barumsaa keessa arge, intala maqaan isaa Iftu ture.\n\nGarbii gara laga ilaale. Bishaanin yaa\'aa ture, dhaabatee hin beeku, gara fuulduraa qofa deema.\n\nInnis akkasuma ta\'uu qaba, inni of-itti hime. Gara fuulduraa.'
        }
      ],
      comments: [{ name: 'Tolera', text: "Baay'ee gaarii! Itti fufi!" }]
    },
    {
      id: 3,
      title: "The Hyena's Laugh",
      author: 'Yonas Haile',
      genre: 'Mystery',
      language: 'English',
      description: 'A detective in Harar investigates a series of strange disappearances connected to the ancient tradition of hyena feeding.',
      emoji: '🦴',
      color: '#2A1A3A',
      coverPhoto: null,
      reads: 6700,
      likes: 540,
      trending: false,
      createdAt: Date.now() - 86400000 * 1,
      chapters: [
        {
          title: 'Chapter 1: The Feeding Hour',
          images: [],
          content: 'Every night at dusk, the hyena man comes.\n\nHe stands at the edge of the old city walls, a basket of scraps in one hand, and calls out in a low, clicking voice that carries across the dark fields. And they come — grey shapes emerging from the shadows, eyes catching the lamplight like scattered coins.\n\nDetective Amir Seid had watched this ritual a dozen times since moving to Harar. He found it beautiful, in a way that made him slightly uneasy.\n\nTonight, though, something was different.\n\nThe hyena man — old Kassim, who had done this for forty years — was not there.\n\nInstead, there was a single hyena, sitting perfectly still at the gate, staring directly at Amir.\n\nIt did not move. It did not make a sound.\n\nIt just watched him, with those pale, ancient eyes.'
        }
      ],
      comments: []
    },
    {
      id: 4,
      title: 'ፍቅር እስከ መቃብር',
      author: 'Tigist Alemu',
      genre: 'Drama',
      language: 'Amharic',
      description: 'Two childhood friends from Gondar are separated by war, poverty, and family secrets — but their bond refuses to break.',
      emoji: '💔',
      color: '#1A1A4A',
      coverPhoto: null,
      reads: 15200,
      likes: 1340,
      trending: true,
      createdAt: Date.now() - 86400000 * 10,
      chapters: [
        {
          title: 'ምዕራፍ 1፡ የልጅነት ቀናት',
          images: [],
          content: 'ጎንደር — ከተማዋ ድሮ ነገሥታት ይኖሩባት ነበር። አሁንም ቢሆን ታሪኳ ከድንጋዮቿ ጋር ተጣብቆ ይኖራል።\n\nሁለቱ ልጆች — ዳዊት እና ሕይወት — ከፋሲለደስ ቤተ-መንግሥት ፊት ለፊት ባለው ጠባብ ጎዳና ላይ ያደጉ ናቸው።\n\nዕለቱ ሐሙስ ነበር። ትምህርት ቤት ከወጡ በኋላ ሁልጊዜ እንደሚያደርጉት ወደ ዋናው ገበያ ሮጡ — ሁለቱም ሳቅ ሞልቷቸው፣ ሁለቱም ያለ ምንም ሸክም።\n\nያ ቀን ሁሉ ነገር ቀላል ነበር።\n\nያ ቀን ሁሉ ነገር ደስተኛ ነበር።\n\nያ ቀን ሁሉ ነገር ለዘለዓለም ይቆያል ብለው ያምኑ ነበር።'
        }
      ],
      comments: [{ name: 'Mekdes', text: 'ይህ ታሪክ ልቤን ሰበረ 💔' }]
    }
  ];
}

// ===== PAGE NAVIGATION =====
function showPage(name) {
  // Require login for Write and Profile pages
  if ((name === 'write' || name === 'profile') && !currentUser) {
    showAuthModal();
    showToast('Please login to access this page.');
    return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo(0, 0);
  if (name !== 'read' && name !== 'chapter') {
    const banner = document.getElementById('previewBanner');
    if (banner) banner.remove();
  }
  if (name === 'home') renderHome();
  if (name === 'browse') renderBrowse();
  if (name === 'profile') renderProfile();
}

// ===== RENDER HOME =====
function renderHome() {
  renderGenreTags();
  const trending = stories.filter(s => s.trending);
  const sorted = [...stories].sort((a, b) => b.createdAt - a.createdAt);
  renderGrid('trendingGrid', trending);
  renderGrid('newGrid', sorted.slice(0, 6));
}

function renderGenreTags() {
  const genres = ['All','Romance','Drama','Mystery','Fantasy','History','Comedy','Thriller','Poetry','Religion','Youth'];
  const el = document.getElementById('genreTags');
  el.innerHTML = '';
  genres.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'genre-tag';
    btn.textContent = g;
    btn.onclick = () => {
      showPage('browse');
      if (g !== 'All') {
        document.getElementById('genreFilter').value = g;
        filterStories();
      }
    };
    el.appendChild(btn);
  });
}

// ===== RENDER STORY GRID =====
function renderGrid(containerId, list) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  if (!list.length) { el.innerHTML = '<p style="color:#666;padding:20px;">No stories found.</p>'; return; }
  list.forEach(s => el.appendChild(makeCard(s)));
}

function makeCard(s) {
  const card = document.createElement('div');
  card.className = 'story-card';
  card.onclick = () => openStory(s.id);

  const coverHtml = s.coverPhoto
    ? `<div class="story-cover"><img src="${s.coverPhoto}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;"></div>`
    : `<div class="story-cover" style="background:${s.color};">${s.emoji}</div>`;

  card.innerHTML = `
    ${coverHtml}
    <div class="story-info">
      <h3>${s.title}</h3>
      <div class="author">by ${s.author}</div>
      <span class="genre-badge">${s.genre}</span>
      <div class="mini-stats">
        <span>👁 ${fmtNum(s.reads)}</span>
        <span>❤️ ${fmtNum(s.likes)}</span>
        <span>📄 ${s.chapters.length}</span>
      </div>
    </div>`;
  return card;
}

function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
}

// ===== BROWSE =====
function renderBrowse() {
  const genreEl = document.getElementById('genreFilter');
  genreEl.innerHTML = '<option value="all">All Genres</option>';
  ['Romance','Drama','Mystery','Fantasy','History','Comedy','Thriller','Poetry','Religion','Youth'].forEach(g => {
    const o = document.createElement('option'); o.value = g; o.textContent = g;
    genreEl.appendChild(o);
  });
  filterStories();
}

function filterStories() {
  const genre = document.getElementById('genreFilter').value;
  const lang = document.getElementById('langFilter').value;
  const sort = document.getElementById('sortFilter').value;

  let list = [...stories];
  if (genre !== 'all') list = list.filter(s => s.genre && s.genre.includes(genre));
  if (lang !== 'all') list = list.filter(s => s.language && s.language.includes(lang));
  if (sort === 'new') list.sort((a, b) => b.createdAt - a.createdAt);
  else if (sort === 'reads') list.sort((a, b) => b.reads - a.reads);
  else list.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));

  renderGrid('browseGrid', list);
}

// ===== OPEN STORY =====
function openStory(id) {
  const s = stories.find(x => x.id === id);
  if (!s) return;
  currentStoryId = id;
  s.reads++;

  if (s.coverPhoto) {
    document.getElementById('readCover').innerHTML = `<img src="${s.coverPhoto}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
    document.getElementById('readCover').style.background = '';
  } else {
    document.getElementById('readCover').innerHTML = s.emoji;
    document.getElementById('readCover').style.background = s.color;
  }

  document.getElementById('readTitle').textContent = s.title;
  document.getElementById('readAuthor').textContent = 'by ' + s.author;
  document.getElementById('readViews').textContent = '👁 ' + fmtNum(s.reads);
  document.getElementById('readLikes').textContent = '❤️ ' + fmtNum(s.likes);
  document.getElementById('readChapters').textContent = '📄 ' + s.chapters.length + ' chapters';
  document.getElementById('readDesc').textContent = s.description;

  const tagsEl = document.getElementById('readTags');
  tagsEl.innerHTML = `<span class="tag">${s.genre}</span><span class="tag">${s.language}</span>`;

  const chList = document.getElementById('chapterList');
  chList.innerHTML = '<h3>Chapters</h3>';
  s.chapters.forEach((ch, i) => {
    const item = document.createElement('div');
    item.className = 'chapter-item';
    item.innerHTML = `<span>${ch.title}</span><small>Chapter ${i + 1}</small>`;
    item.onclick = () => openChapter(i);
    chList.appendChild(item);
  });

  // Show Add Chapter button only if this is the author's story
  const addBtn = document.getElementById('addChapterBtn');
  const addForm = document.getElementById('addChapterForm');
  const isMyStory = (currentUser && s.authorId === currentUser.id) || myStoryIds.includes(s.id);
  addBtn.style.display = isMyStory ? 'inline-flex' : 'none';
  addForm.style.display = 'none';
  document.getElementById('newChTitle').value = '';
  document.getElementById('newChContent').value = '';

  showPage('read');
}

function startReading() { openChapter(0); }

function openChapter(index) {
  const s = stories.find(x => x.id === currentStoryId);
  if (!s) return;
  currentChapterIndex = index;
  const ch = s.chapters[index];

  document.getElementById('chapterTitle').textContent = ch.title;

  let contentHtml = ch.content.replace(/\n/g, '<br>');
  if (ch.images && ch.images.length) {
    ch.images.forEach(imgSrc => {
      contentHtml += `<br><img src="${imgSrc}" alt="chapter image" style="max-width:100%;border-radius:10px;margin:16px 0;">`;
    });
  }
  document.getElementById('chapterContent').innerHTML = contentHtml;

  renderComments(s, index);
  showPage('chapter');
}

function prevChapter() {
  if (currentChapterIndex > 0) openChapter(currentChapterIndex - 1);
}
function nextChapter() {
  const s = stories.find(x => x.id === currentStoryId);
  if (s && currentChapterIndex < s.chapters.length - 1) openChapter(currentChapterIndex + 1);
}

// ===== LIKE =====
async function likeStory() {
  if (!currentUser) { showAuthModal(); return; }
  const s = stories.find(x => x.id === currentStoryId);
  if (!s) return;
  if (typeof s.id === 'number' && s.id > 4) {
    const data = await apiFetch('/api/stories/' + s.id + '/like', { method: 'POST' });
    if (data.alreadyLiked) { showToast('You already liked this story!'); return; }
    if (data.likes !== undefined) s.likes = data.likes;
  } else {
    s.likes++;
  }
  document.getElementById('readLikes').textContent = '❤️ ' + fmtNum(s.likes);
  showToast('❤️ Liked!');
}

// ===== COMMENTS =====
function renderComments(s, chIndex) {
  const list = document.getElementById('commentsList');
  list.innerHTML = '';
  const comments = s.comments || [];
  if (!comments.length) { list.innerHTML = '<p style="color:#555;font-size:0.85rem;">No comments yet. Be the first!</p>'; return; }
  comments.forEach(c => {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `<div class="c-name">${c.name}</div><div class="c-text">${c.text}</div>`;
    list.appendChild(div);
  });
}

async function addComment() {
  if (!currentUser) { showAuthModal(); showToast('Please login to comment.'); return; }
  const name = document.getElementById('commentName').value.trim() || currentUser.username;
  const text = document.getElementById('commentText').value.trim();
  if (!text) { showToast('Please write a comment.'); return; }
  const s = stories.find(x => x.id === currentStoryId);
  if (!s) return;

  if (typeof s.id === 'number' && s.id > 4) {
    const comments = await apiFetch('/api/stories/' + s.id + '/comments', { method: 'POST', body: JSON.stringify({ text }) });
    if (!comments.error) s.comments = comments;
  } else {
    s.comments.push({ name, text });
  }

  document.getElementById('commentName').value = '';
  document.getElementById('commentText').value = '';
  renderComments(s, currentChapterIndex);
  showToast('💬 Comment posted!');
}

// ===== PHOTO UPLOAD HANDLERS =====
function previewCover(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    coverPhotoData = e.target.result;
    const preview = document.getElementById('coverPreview');
    const label = document.getElementById('coverUploadLabel');
    preview.src = coverPhotoData;
    preview.style.display = 'block';
    label.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function previewChapterImages(event) {
  const files = Array.from(event.target.files);
  const container = document.getElementById('chapterImgPreviews');
  chapterImageDatas = [];
  container.innerHTML = '';
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      chapterImageDatas.push(e.target.result);
      const img = document.createElement('img');
      img.src = e.target.result;
      container.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function changeProfilePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const avatar = document.getElementById('avatarDisplay');
    avatar.innerHTML = `<img src="${e.target.result}" alt="Profile"><input type="file" id="profilePhotoInput" accept="image/*" style="display:none;" onchange="changeProfilePhoto(event)">`;
    showToast('�� Profile photo updated!');
  };
  reader.readAsDataURL(file);
}

// ===== WRITE / SUBMIT STORY =====
function getSelectedLangs() {
  const checked = document.querySelectorAll('#storyLangGroup input:checked');
  const langs = Array.from(checked).map(c => c.value);
  return langs.length ? langs.join(', ') : 'Amharic';
}

function getSelectedGenres() {
  const checked = document.querySelectorAll('#storyGenreGroup input:checked');
  const genres = Array.from(checked).map(c => c.value);
  return genres.length ? genres.join(', ') : 'Drama';
}

function previewStory() {
  const title = document.getElementById('storyTitle').value.trim() || 'Untitled Story';
  const author = document.getElementById('authorName').value.trim() || 'Anonymous';
  const desc = document.getElementById('storyDesc').value.trim() || 'No description.';
  const genre = getSelectedGenres();
  const lang = getSelectedLangs();
  const emoji = document.getElementById('coverEmoji').value || '📖';
  const color = document.getElementById('coverColor').value;
  const ch1Title = document.getElementById('ch1Title').value.trim() || 'Chapter 1';
  const ch1Content = document.getElementById('ch1Content').value.trim() || 'No content yet.';

  // Build a temporary preview story object
  const preview = {
    id: '__preview__',
    title, author, genre, language: lang, description: desc,
    emoji, color,
    coverPhoto: coverPhotoData || null,
    reads: 0, likes: 0,
    chapters: [{ title: ch1Title, content: ch1Content, images: [...chapterImageDatas] }],
    comments: []
  };

  // Inject into stories temporarily
  const existing = stories.findIndex(s => s.id === '__preview__');
  if (existing >= 0) stories.splice(existing, 1);
  stories.unshift(preview);

  // Show the read page with a preview banner
  openStory('__preview__');

  // Add preview banner
  setTimeout(() => {
    const existing = document.getElementById('previewBanner');
    if (existing) existing.remove();
    const banner = document.createElement('div');
    banner.id = 'previewBanner';
    banner.innerHTML = `
      <span>👁️ Preview Mode — this is how readers will see your story</span>
      <button onclick="closePreview()">← Back to Editor</button>
    `;
    Object.assign(banner.style, {
      position: 'fixed', top: '64px', left: '0', right: '0',
      background: 'linear-gradient(135deg, #078930, #0891b2)',
      color: '#fff', padding: '10px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      zIndex: '999', fontSize: '0.9rem', fontWeight: '600',
      boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
    });
    banner.querySelector('button').style.cssText =
      'background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;';
    document.body.appendChild(banner);
  }, 100);
}

function closePreview() {
  // Remove preview story
  const idx = stories.findIndex(s => s.id === '__preview__');
  if (idx >= 0) stories.splice(idx, 1);
  // Remove banner
  const banner = document.getElementById('previewBanner');
  if (banner) banner.remove();
  showPage('write');
}

async function submitStory(e) {
  e.preventDefault();
  if (!currentUser) { showAuthModal(); showToast('Please login to publish a story.'); return; }

  const title = document.getElementById('storyTitle').value.trim();
  const desc = document.getElementById('storyDesc').value.trim();
  const genre = getSelectedGenres();
  const lang = getSelectedLangs();
  const emoji = document.getElementById('coverEmoji').value || '📖';
  const color = document.getElementById('coverColor').value;
  const ch1Title = document.getElementById('ch1Title').value.trim();
  const ch1Content = document.getElementById('ch1Content').value.trim();

  const payload = {
    title, genre, language: lang, description: desc,
    emoji, color,
    coverPhoto: coverPhotoData || null,
    chapters: [{ title: ch1Title, content: ch1Content, images: [...chapterImageDatas] }]
  };

  const newStory = await apiFetch('/api/stories', { method: 'POST', body: JSON.stringify(payload) });
  if (newStory.error) { showToast('Error: ' + newStory.error); return; }

  stories.unshift(newStory);
  myStoryIds.push(newStory.id);

  document.getElementById('storyForm').reset();
  coverPhotoData = null;
  chapterImageDatas = [];
  document.getElementById('coverPreview').style.display = 'none';
  document.getElementById('coverUploadLabel').style.display = 'block';
  document.getElementById('chapterImgPreviews').innerHTML = '';

  showToast('🎉 Story published successfully!');
  setTimeout(() => openStory(newStory.id), 1200);
}

// ===== PROFILE =====
function renderProfile() {
  if (!currentUser) { showAuthModal(); return; }
  const myStories = stories.filter(s => s.authorId === currentUser.id || myStoryIds.includes(s.id));
  document.getElementById('statStories').textContent = myStories.length;
  document.getElementById('statReads').textContent = fmtNum(myStories.reduce((a, s) => a + s.reads, 0));
  document.getElementById('statLikes').textContent = fmtNum(myStories.reduce((a, s) => a + s.likes, 0));
  renderGrid('myStoriesGrid', myStories);
}

// ===== SEARCH =====
function searchStories() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!q) return;
  document.getElementById('searchQuery').textContent = q;
  const results = stories.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.author.toLowerCase().includes(q) ||
    s.genre.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  );
  renderGrid('searchGrid', results);
  showPage('search');
}

document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') searchStories();
});

// ===== TOAST =====
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', bottom: '30px', right: '30px',
    background: document.body.classList.contains('dark') ? '#c0392b' : '#DA121A', color: 'white',
    padding: '12px 20px', borderRadius: '10px',
    fontWeight: '600', zIndex: '9999',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    fontSize: '0.95rem', transition: 'opacity 0.4s'
  });
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2500);
}


// ===== ADD CHAPTER =====
let newChapterImageDatas = [];

function showAddChapter() {
  document.getElementById('addChapterForm').style.display = 'block';
  document.getElementById('addChapterBtn').style.display = 'none';
  document.getElementById('addChapterForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelAddChapter() {
  document.getElementById('addChapterForm').style.display = 'none';
  document.getElementById('addChapterBtn').style.display = 'inline-flex';
  document.getElementById('newChTitle').value = '';
  document.getElementById('newChContent').value = '';
  document.getElementById('newChImgPreviews').innerHTML = '';
  newChapterImageDatas = [];
}

function previewNewChImages(event) {
  const files = Array.from(event.target.files);
  const container = document.getElementById('newChImgPreviews');
  newChapterImageDatas = [];
  container.innerHTML = '';
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      newChapterImageDatas.push(e.target.result);
      const img = document.createElement('img');
      img.src = e.target.result;
      container.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

async function saveNewChapter() {
  const title = document.getElementById('newChTitle').value.trim();
  const content = document.getElementById('newChContent').value.trim();
  if (!title) { showToast('Please enter a chapter title.'); return; }
  if (!content) { showToast('Please write some content.'); return; }

  const s = stories.find(x => x.id === currentStoryId);
  if (!s) return;

  const chapter = { title, content, images: [...newChapterImageDatas] };

  // If it's a real API story, save to server
  if (typeof s.id === 'number' && s.id > 4) {
    const updated = await apiFetch('/api/stories/' + s.id + '/chapters', { method: 'POST', body: JSON.stringify(chapter) });
    if (updated.error) { showToast('Error: ' + updated.error); return; }
    s.chapters = updated.chapters;
  } else {
    s.chapters.push(chapter);
  }

  document.getElementById('readChapters').textContent = '📄 ' + s.chapters.length + ' chapters';
  const chList = document.getElementById('chapterList');
  chList.innerHTML = '<h3>Chapters</h3>';
  s.chapters.forEach((ch, i) => {
    const item = document.createElement('div');
    item.className = 'chapter-item';
    item.innerHTML = `<span>${ch.title}</span><small>Chapter ${i + 1}</small>`;
    item.onclick = () => openChapter(i);
    chList.appendChild(item);
  });

  cancelAddChapter();
  showToast('🎉 Chapter ' + s.chapters.length + ' published!');
}

  // Update chapter count display
  document.getElementById('readChapters').textContent = '📄 ' + s.chapters.length + ' chapters';

  // Rebuild chapter list
  const chList = document.getElementById('chapterList');
  chList.innerHTML = '<h3>Chapters</h3>';
  s.chapters.forEach((ch, i) => {
    const item = document.createElement('div');
    item.className = 'chapter-item';
    item.innerHTML = `<span>${ch.title}</span><small>Chapter ${i + 1}</small>`;
    item.onclick = () => openChapter(i);
    chList.appendChild(item);
  });

  cancelAddChapter();
  showToast('🎉 Chapter ' + s.chapters.length + ' published!');
}

// ===== LANGUAGE SWITCHER =====
const translations = {
  en: {
    home: 'Home', browse: 'Browse', write: 'Write', profile: 'My Profile',
    search: 'Search stories...',
    heroSub: "Ethiopia's home for stories — read, write, and share in Amharic, Afaan Oromo, Tigrinya & more.",
    startReading: 'Start Reading', startWriting: 'Start Writing',
    browseGenre: 'Browse by Genre', trending: '🔥 Trending Stories', newArrivals: '✨ New Arrivals',
    browseTitle: 'Browse Stories', allGenres: 'All Genres', allLangs: 'All Languages',
    sortTrending: 'Trending', sortNew: 'Newest', sortReads: 'Most Read',
    writeTitle: '✍️ Publish Your Story',
    storyTitleL: 'Story Title', authorL: 'Author Name', descL: 'Description',
    genreL: 'Genre', langL: 'Language', ch1TitleL: 'Chapter 1 Title', ch1ContentL: 'Chapter 1 Content',
    publishBtn: '📤 Publish Story', readNow: 'Read Now',
    chapters: 'Chapters', comments: 'Comments', postComment: 'Post Comment',
    yourName: 'Your name', yourThoughts: 'Share your thoughts...',
    myStories: 'My Published Stories', back: '← Back'
  },
  am: {
    home: 'መነሻ', browse: 'ፈልግ', write: 'ጻፍ', profile: 'መገለጫዬ',
    search: 'ታሪኮችን ፈልግ...',
    heroSub: 'ኢትዮጵያ የታሪኮች ቤት — በአማርኛ፣ ኦሮምኛ፣ ትግርኛ እና ሌሎች ቋንቋዎች ያንብቡ፣ ይጻፉ እና ያጋሩ።',
    startReading: 'ማንበብ ጀምር', startWriting: 'መጻፍ ጀምር',
    browseGenre: 'በዘርፍ ፈልግ', trending: '🔥 ተወዳጅ ታሪኮች', newArrivals: '✨ አዲስ ታሪኮች',
    browseTitle: 'ታሪኮችን ፈልግ', allGenres: 'ሁሉም ዘርፎች', allLangs: 'ሁሉም ቋንቋዎች',
    sortTrending: 'ተወዳጅ', sortNew: 'አዲስ', sortReads: 'ብዙ የተነበበ',
    writeTitle: '✍️ ታሪክህን አሳትም',
    storyTitleL: 'የታሪክ ርዕስ', authorL: 'የደራሲ ስም', descL: 'መግለጫ',
    genreL: 'ዘርፍ', langL: 'ቋንቋ', ch1TitleL: 'የምዕራፍ 1 ርዕስ', ch1ContentL: 'የምዕራፍ 1 ይዘት',
    publishBtn: '📤 ታሪክ አሳትም', readNow: 'አሁን አንብብ',
    chapters: 'ምዕራፎች', comments: 'አስተያየቶች', postComment: 'አስተያየት ለጥፍ',
    yourName: 'ስምህ', yourThoughts: 'ሃሳብህን አጋራ...',
    myStories: 'የታተሙ ታሪኮቼ', back: '← ተመለስ'
  }
};

let currentLang = 'en';

function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const t = translations[lang];

  // Navbar
  document.querySelector('.nav-links button:nth-child(1)').textContent = t.home;
  document.querySelector('.nav-links button:nth-child(2)').textContent = t.browse;
  document.querySelector('.nav-links button:nth-child(3)').textContent = t.write;
  document.querySelector('.nav-links button:nth-child(4)').textContent = t.profile;
  document.getElementById('searchInput').placeholder = t.search;

  // Hero
  const heroP = document.querySelector('.hero-content p');
  if (heroP) heroP.textContent = t.heroSub;
  const heroBtns = document.querySelectorAll('.hero-btns button');
  if (heroBtns[0]) heroBtns[0].textContent = t.startReading;
  if (heroBtns[1]) heroBtns[1].textContent = t.startWriting;

  // Section headings
  const h2s = document.querySelectorAll('.h2-text');
  if (h2s[0]) h2s[0].textContent = t.browseGenre;
  if (h2s[1]) h2s[1].textContent = t.trending;
  if (h2s[2]) h2s[2].textContent = t.newArrivals;

  // Browse
  const browseH1 = document.querySelector('.browse-header h1');
  if (browseH1) browseH1.textContent = t.browseTitle;
  const genreFilter = document.getElementById('genreFilter');
  if (genreFilter && genreFilter.options[0]) genreFilter.options[0].text = t.allGenres;
  const langFilter = document.getElementById('langFilter');
  if (langFilter && langFilter.options[0]) langFilter.options[0].text = t.allLangs;
  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) {
    if (sortFilter.options[0]) sortFilter.options[0].text = t.sortTrending;
    if (sortFilter.options[1]) sortFilter.options[1].text = t.sortNew;
    if (sortFilter.options[2]) sortFilter.options[2].text = t.sortReads;
  }

  // Write form labels
  const labels = document.querySelectorAll('.write-container .form-group label');
  const labelMap = [t.storyTitleL, t.authorL, t.descL, t.genreL, t.langL];
  labels.forEach((l, i) => { if (labelMap[i]) l.textContent = labelMap[i]; });
  const writeH1 = document.querySelector('.write-container h1');
  if (writeH1) writeH1.textContent = t.writeTitle;
  const publishBtn = document.querySelector('.big-btn');
  if (publishBtn) publishBtn.textContent = t.publishBtn;

  // Comments
  const commentH3 = document.querySelector('.comments-section h3');
  if (commentH3) commentH3.textContent = t.comments;
  const commentNameInput = document.getElementById('commentName');
  if (commentNameInput) commentNameInput.placeholder = t.yourName;
  const commentTextInput = document.getElementById('commentText');
  if (commentTextInput) commentTextInput.placeholder = t.yourThoughts;
  const postBtn = document.querySelector('.comments-section .btn-primary');
  if (postBtn) postBtn.textContent = t.postComment;

  // Profile
  const myStoriesH3 = document.querySelector('.profile-container h3');
  if (myStoriesH3) myStoriesH3.textContent = t.myStories;

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(b => b.textContent = t.back);

  // Re-render genre tags in new language
  renderGenreTags();
}

// ===== DARK MODE =====
function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('darkToggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

// Apply saved theme immediately
(function() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    document.documentElement.classList.add('dark');
    const btn = document.getElementById('darkToggle');
    if (btn) btn.textContent = '☀️';
  }
})();
// ===== PERSIST TO LOCALSTORAGE =====
function saveToStorage() {
  try {
    // Save only user-written stories (not sample ones with numeric ids 1-4)
    const userStories = stories.filter(s => typeof s.id === 'number' && s.id > 4 || typeof s.id === 'string' && s.id !== '__preview__');
    localStorage.setItem('qalat_stories', JSON.stringify(userStories));
    localStorage.setItem('qalat_myIds', JSON.stringify(myStoryIds));
  } catch(e) {
    // localStorage might be full (large images) — warn user
    showToast('⚠️ Could not save: try using smaller images.');
  }
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('qalat_stories');
    const savedIds = localStorage.getItem('qalat_myIds');
    if (saved) {
      const userStories = JSON.parse(saved);
      // Merge: put user stories at the front, keep sample stories at back
      stories = [...userStories, ...stories];
    }
    if (savedIds) {
      myStoryIds = JSON.parse(savedIds);
    }
  } catch(e) { /* ignore parse errors */ }
}

// ===== INIT =====
async function init() {
  loadSampleStories();
  // Load stories from server
  const serverStories = await apiFetch('/api/stories');
  if (Array.isArray(serverStories)) {
    // Merge: server stories first, then sample stories
    stories = [...serverStories, ...stories];
    // Track which stories belong to current user
    if (currentUser) {
      myStoryIds = serverStories.filter(s => s.authorId === currentUser.id).map(s => s.id);
    }
  }
  await restoreSession();
  renderHome();
  hideAuthModal(); // always hidden on load
}

init();

// Restore saved language
(function() {
  const savedLang = localStorage.getItem('lang') || 'en';
  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.value = savedLang;
  if (savedLang !== 'en') switchLang(savedLang);
})();