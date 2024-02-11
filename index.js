const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Подключение к базе данных MongoDB
mongoose.connect('mongodb://localhost:27017/blog', { useNewUrlParser: true, useUnifiedTopology: true });

// Обработка событий подключения и ошибки
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('MongoDB connected');
});

// Middleware для обработки JSON-данных
app.use(bodyParser.json());

// Определение схемы и модели MongoDB
const blogSchema = new mongoose.Schema({
    title: String,
    body: String,
    author: String,
    timestamps: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

// Роуты для CRUD операций
app.post('/blogs', async (req, res) => {
    try {
        // Проверяем, что все обязательные поля заполнены
        if (!req.body.title || !req.body.body || !req.body.author) {
            res.status(400).json({ error: 'Title, body, and author are required' });
            return;
        }

        const newBlog = await Blog.create(req.body);
        res.status(201).json(newBlog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }
        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/blogs/:id', async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBlog) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }
        res.json(updatedBlog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.delete('/blogs/:id', async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }
        res.json(deletedBlog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
