    const User = require('../models/user');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const multer = require('multer');
require("dotenv").config();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Diretório onde as imagens serão armazenadas
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Nomeia o arquivo com a data atual e o nome original
    }
});

exports.upload = multer({
    storage: storage, fileFilter: function (req, file, callback) {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg") {
            callback(null, true)
        } else {
            console.log("Errorr");
            callback(null, true)

        }
    }, limits: {
        fileSize: 1024 * 1024 * 2
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
                image: req.file
            });

            await newUser.save();
            res.status(201).json({ message: 'Usuário registrado com sucesso' });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao registrar usuário' });
        }
    }
];


exports.login = async (req, res) => {
    const { username, idEmployee, password } = req.body;
    console.log(username, password);
    
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Senha incorreta' });

        console.log("Login realizado");
        res.status(200).json({ message: 'Login realizado com sucesso', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};
