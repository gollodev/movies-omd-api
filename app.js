const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const axios = require('axios');

// configs
const baseUrl = 'http://www.omdbapi.com/?i=tt3896198&apikey=5eec5adc&s=love&y=2020';

// initialize app
const port = process.env.PORT || 8000
const app = express()

app.use(cors());
app.use(express.json())

// connect database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

sequelize.authenticate()
         .then(() => console.log('Connection has been established successfully.'))
         .catch(err => console.error('Unable to connect to the database:', err))

// model
const Movie = sequelize.define('Movie', {
    imdbID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Title: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    Year: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    Type: { 
        type: DataTypes.STRING, 
        allowNull: false
    },
    Poster: { 
        type: DataTypes.STRING,
        allowNull: false
    }
});

Movie.sequelize.sync();

const saveMovies = async () => {
    const movie = await Movie.findAll();
    if (movie.length === 0) {
        console.log('No movies found...');
        try {
            const movies = await axios.get(baseUrl);
            Movie.bulkCreate(movies.data.Search)
                 .then(() => console.log('Added movies to database', Movie.length))
                 .catch(err => console.error(err))
        } catch (error) {
            console.err(error);
        }
    } else {
        console.log('Movies Save :)');
    }
};

saveMovies();

app.use('/movies', async (_, res) => {
    try {
        const movies = await Movie.findAll();
        return res.status(200).json(movies);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

app.use('/', (req, res) => res.json({ message: 'Welcome to OMBDA API REST' }));

app.listen(port, () => console.log(`Server Listen on port ${port}`));

