// ===== STATE =====
let stories = [];
let currentStoryId = null;
let currentChapterIndex = 0;
let myStoryIds = [];
let coverPhotoData = null;
let chapterImageDatas = [];

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
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo(0, 0);
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
  if (genre !== 'all') list = list.filter(s => s.genre === genre);
  if (lang !== 'all') list = list.filter(s => s.language === lang);
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
function likeStory() {
  const s = stories.find(x => x.id === currentStoryId);
  if (!s) return;
  s.likes++;
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

function addComment() {
  const name = document.getElementById('commentName').value.trim();
  const text = document.getElementById('commentText').value.trim();
  if (!name || !text) { showToast('Please enter your name and comment.'); return; }
  const s = stories.find(x => x.id === currentStoryId);
  if (!s) return;
  s.comments.push({ name, text });
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
function submitStory(e) {
  e.preventDefault();
  const title = document.getElementById('storyTitle').value.trim();
  const author = document.getElementById('authorName').value.trim();
  const desc = document.getElementById('storyDesc').value.trim();
  const genre = document.getElementById('storyGenre').value;
  const lang = document.getElementById('storyLang').value;
  const emoji = document.getElementById('coverEmoji').value || '📖';
  const color = document.getElementById('coverColor').value;
  const ch1Title = document.getElementById('ch1Title').value.trim();
  const ch1Content = document.getElementById('ch1Content').value.trim();

  const newStory = {
    id: Date.now(),
    title, author, genre, language: lang, description: desc,
    emoji, color,
    coverPhoto: coverPhotoData || null,
    reads: 0, likes: 0, trending: false,
    createdAt: Date.now(),
    chapters: [{ title: ch1Title, content: ch1Content, images: [...chapterImageDatas] }],
    comments: []
  };

  stories.unshift(newStory);
  myStoryIds.push(newStory.id);

  // reset
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
  const myStories = stories.filter(s => myStoryIds.includes(s.id));
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


// ===== DARK MODE =====
function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('darkToggle').textContent = isDark ? '☀️' : '🌙';
}

// Apply saved theme on load
(function() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    window.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('darkToggle');
      if (btn) btn.textContent = '☀️';
    });
  }
})();
// ===== INIT =====
loadSampleStories();
renderHome();