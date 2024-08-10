const express = require('express')
const bodyParser = require('body-parser')
const authRouter = require('./routes/authRoutes');
const cors = require('cors')

const app = express();
app.use(cors());

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('<h1>WELCOME<h1>'));
app.use('/auth', authRouter)
app.post('/', (req, res) => res.send({message: 'success'}));

app.listen(3000, ()=> console.log('server started'))
