const express = require('express');

const config = require('config');
const logger = require('./logger');
const Joi = require('joi');
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true})); //encode the body of request as Json
app.use(express.static('public'));
app.use(helmet());

//Configuration
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server: ' + config.get('mail.host'));
console.log('Mail Password: ' + config.get('mail.password'));


if(app.get('env') ==='development') {
    app.use(morgan('tiny'));
    console.log('Morgan enabled...');
}

app.use(logger);

app.use(function(req,res,next) {
    console.log("Authenticating...");
    next();
})

app.get('/',(req,res) => {
    res.send('hello world');
})

const genres = [
    { id: 1, name: 'Action' },  
    { id: 2, name: 'Horror' },  
    { id: 3, name: 'Romance' },
]

app.get('/api/genres',(req,res) => {
    res.send(genres);
});

app.post('/api/genres', (req,res) => {
    const {error} = validateGenres(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const genre = {
        id: genres.length + 1,
        name: req.body.name
    }

    genres.push(genre);
    res.send(genre);
})

app.put('/api/genres/:id', (req, res) => {
    const genre = genres.find(c => c.id === parseInt(req.params.id));
    if (!genre) return res.status(404).send('The genre with the given ID was not found.');
  
    const { error } = validateGenre(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
    
    genre.name = req.body.name; 
    res.send(genre);
  });
  
  app.delete('/api/genres/:id', (req, res) => {
    const genre = genres.find(c => c.id === parseInt(req.params.id));
    if (!genre) return res.status(404).send('The genre with the given ID was not found.');
  
    const index = genres.indexOf(genre);
    genres.splice(index, 1);
  
    res.send(genre);
  });
  
  app.get('/api/genres/:id', (req, res) => {
    const genre = genres.find(c => c.id === parseInt(req.params.id));
    if (!genre) return res.status(404).send('The genre with the given ID was not found.');
    res.send(genre);
  });

function validateGenres(genre) {
    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(genre,schema);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listenning to port ${port}...`));