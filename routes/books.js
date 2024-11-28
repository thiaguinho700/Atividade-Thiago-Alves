const express = require('express');
const Book = require('../models/Books');
const router = express.Router();
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Defina o diretório onde os arquivos serão salvos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Formato de arquivo inválido. Apenas JPEG e PNG são permitidos."));
        }
    },
    limits: { fileSize: 1024 * 1024 * 2 }, // Limite de 2MB
});

router.post('/', upload.single("image"), async (req, res) => {
    const { title, author, year, ISBN } = req.body;
    try {
        const newBook = new Book({
            title,
            author,
            year,
            ISBN,
            image: req.file?.path
        });
        await newBook.save();
        res.status(201).json(newBook);

    } catch (error) {
        console.error('Erro ao cadastrar livro:', error);
        res.status(500).json({ message: 'Erro ao cadastrar livro', error });
    }
});

exports.register = [
    async (req, res) => {
        const { username, password, idEmployee, email } = req.body;

        try {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Usuário já existe' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                username,
                password: hashedPassword,
                idEmployee,
                email,
                image: req.file.path
            });

            await newUser.save();
            res.status(201).json({ message: 'Usuário registrado com sucesso' });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao registrar usuário' });
        }
    }
];

router.get("/", async (req, res) => {
    try {
        const books = await Book.find()
        res.status(200).json(books)
    } catch (error) {
        console.error("Erro ao retornar os dados", error)
    }
})

// Rota para buscar livros pelo título
router.get('/search', async (req, res) => {
    const { title } = req.query;
    try {
        const books = await Book.find({
            title: { $regex: title, $options: 'i' } 
        });
        res.status(200).json(books);
    } catch (error) {
        console.error('Erro ao buscar livros por título:', error);
        res.status(500).json({ message: 'Erro ao buscar livros', error });
    }
});


router.put('/:id', async (req, res) => {
    const { title, author, year } = req.body;

    try {
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, { title, author, year }, { new: true });
        if (!updatedBook) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }
        res.status(200).json(updatedBook);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar livro', error });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }
        res.status(200).json({ message: 'Livro deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar livro', error });
    }
});

module.exports = router;