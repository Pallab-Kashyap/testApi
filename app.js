const express = require('express')
const bodyParser = require('body-parser')
const authRouter = require('./routes/authRoutes');
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const webhookRouter = require('./routes/webhookRoutes')
const publicationRouter = require('./routes/publicationRoutes');
const { testPub } = require('./controller/publicationController');
const dotenv = require('dotenv')

dotenv.config()
const app = express();

const limiter = rateLimit({
    max: 3,
    windowMs: 60*1000,
    message: 'to many requests'
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('<h1>WELCOME<h1>'));
app.get('/testLimit', limiter, (req, res) => res.send({message: 'success'}));
app.use('/api/auth', authRouter)
app.use('/api/webhook', webhookRouter)
app.use('/api/publications', publicationRouter)
app.use('/api/testPub', testPub)
app.use((req, res, next) => {
    res.status(404).render('404', { title: '404 Not Found' }); // Render a custom 404 page
});

app.listen(3000, ()=> console.log('server started'))
