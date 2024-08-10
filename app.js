const express = require('express')
const bodyParser = require('body-parser')
const authRouter = require('./routes/authRoutes');
const cors = require('cors')
// const rateLimit = require('express-rate-limit')

const app = express();
app.use(cors());

const limiter = rateLimit({
    max: 2,
    windowMs: 60*1000,
    message: 'to many requests'
})

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('<h1>WELCOME<h1>'));
app.get('/home' (req,res) => res.send('<h1>HOME<h1>'));
app.use('/auth', authRouter)
app.post('/', (req, res) => res.send({message: 'success'}));
app.use((req, res, next) => {
    res.status(404).render('404', { title: '404 Not Found' }); // Render a custom 404 page
});

app.listen(3000, ()=> console.log('server started'))
