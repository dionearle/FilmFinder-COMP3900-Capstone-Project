var mongoose = require("mongoose");
var Actor = mongoose.model('Actor');
var Movie = mongoose.model('movies');

module.exports = {

    // Find all movies that exist in the current database
    // and add their actors and directors to the
    // Actor collection in the database.
    testAdd: async function(req, res) {

        Movie.find(async(err, movie) => {

            for (let i = 0; i < movie.length; i++) {

                let movieDirectorlist = movie[i].directors;

                for (let j = 0; j < movieDirectorlist.length; j++) {

                    try {
                        let result = await checkAndCreate(movieDirectorlist[j], movie[i]._id, "director");
                        console.log(result);
                    } catch (err) {
                        console.log(err);
                    }
                }

                let movieActorlist = movie[i].cast;

                for (let k = 0; k < movieActorlist.length; k++) {

                    try {
                        let result = await checkAndCreate(movieActorlist[k], movie[i]._id, "cast");
                        console.log(result);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        });
    }
}

async function checkAndCreate(actorName, movieID, Actorjob) {

    return new Promise((resolve, reject) => {

        Actor.findOne({ name: actorName }).exec(async(err, result) => {

            if (err) {
                console.log(err);
                reject(err);
            }

            if (!result) {

                console.log(movieID);

                try {

                    let findMovie = await findMovieHelper(movieID);

                    if (findMovie == null) {
                        reject("movie not exit");
                    }

                    let id = findMovie._id;
                    let newActor = new Actor({
                        name: actorName,
                        job: Actorjob,
                        movies: [id],
                        rating: 0,
                    });

                    // We then save this new movie document
                    // to the movie database.
                    try {
                        let actor = await savehelper(newActor);
                        return resolve(actor);
                    } catch (err) {
                        return reject(err);
                    }

                } catch (err) {
                    return reject(err);
                }
            }

            console.log(result);

            result.movies.push(mongoose.Types.ObjectId(movieID));

            try {
                let actor = await savehelper(result);
                return resolve(actor);
            } catch (err) {
                return reject(err);
            }
        });
    });
}

async function savehelper(newActor) {

    return new Promise((resolve, reject) => {

        newActor.save(function(err, actor) {

            if (err) {
                return reject(err);
            }

            return resolve(actor);
        });
    });
}

async function findMovieHelper(movieID) {

    return new Promise((resolve, reject) => {

        Movie.findById(movieID, function(err, movie) {

            if (err) {
                return reject(err);
            }

            return resolve(movie);
        });
    });
}