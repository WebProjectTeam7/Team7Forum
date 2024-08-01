import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const posts = [];
let nextPostId = 1;

app.get('/posts', (req, res) => {
  if (req.query.search) {
    res.json(posts.filter((post) =>
      post.title.toLowerCase().includes(req.query.search.toLowerCase())
    ));
    return;
  }
  
  res.json(posts);
});

app.get('/posts/:id', (req, res) => {
  const post = posts.find((post) => post.id === +req.params.id);

  if (!post) {
    res.sendStatus(404);
    return;
  }

  res.json(post);
});

app.post('/posts', (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content || !author) {
    res.status(400).json({ error: 'Title, content, and author are required' });
    return;
  }

  const post = {
    id: nextPostId++,
    title,
    content,
    author,
    createdOn: new Date(),
    comments: [],
    likes: 0
  };
  posts.push(post);

  res.status(201).json(post);
});

app.put('/posts/:id', (req, res) => {
  const post = posts.find((post) => post.id === +req.params.id);

  if (!post) {
    res.sendStatus(404);
    return;
  }

  const { title, content } = req.body;
  
  if (title) post.title = title;
  if (content) post.content = content;

  res.json(post);
});

app.delete('/posts/:id', (req, res) => {
  const index = posts.findIndex((post) => post.id === +req.params.id);

  if (index === -1) {
    res.sendStatus(404);
    return;
  }

  posts.splice(index, 1);

  res.sendStatus(204);
});

app.post('/posts/:id/comments', (req, res) => {
  const post = posts.find((post) => post.id === +req.params.id);

  if (!post) {
    res.sendStatus(404);
    return;
  }

  const { comment, author } = req.body;

  if (!comment || !author) {
    res.status(400).json({ error: 'Comment and author are required' });
    return;
  }

  const newComment = {
    id: post.comments.length + 1,
    comment,
    author,
    createdOn: new Date()
  };

  post.comments.push(newComment);

  res.status(201).json(newComment);
});

app.post('/posts/:id/like', (req, res) => {
  const post = posts.find((post) => post.id === +req.params.id);

  if (!post) {
    res.sendStatus(404);
    return;
  }

  post.likes += 1;

  res.json({ likes: post.likes });
});

app.post('/posts/:id/unlike', (req, res) => {
  const post = posts.find((post) => post.id === +req.params.id);

  if (!post) {
    res.sendStatus(404);
    return;
  }

  if (post.likes > 0) {
    post.likes -= 1;
  }

  res.json({ likes: post.likes });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
