# COMP3900 Capstone Project | FilmFinder
> Developed by @Multifactored, @dionearle, @sarahilwil, @RohailAbdullah and @AlexPointer at the University of New South Wales.

This site is to show a list of indexed films to users for them to get new movies to watch. It has a range of features including:
* Wishlists
* Displaying the details of films, directors and actors
* Recommendations of Movies
* Reviews
* Groups
* Administration Functions

The development of the project completed on the 16th of November, 2020.

## Usage of the Project
#### Instructions for First Time Setup
- Open a terminal window and navigate into the project folder.
- Run the command `npm install` to install the backend dependencies.
- Open a separate terminal window and cd into the ‘/client’ directory from the project folder.
- In this second terminal window run the command `npm install` to install the frontend dependencies.

#### Instructions for Subsequent Runs
- Run `npm start` in the first terminal window to start the backend server.
- Run `npm start` in the second terminal window to start the frontend website.
- Open http://localhost:4200 in a browser to access the site.

## Contact
* Wisley Chau : multifactored@gmail.com

## Brief Documentation
/api - Contains our backend API, routing etc (express)
- /api/config: Contains config files for the API
- /api/controllers:  the controllers that are called when a new route is accessed, doing stuff like interacting with the database
- /api/models: interacting with database, contains definitions for users etc for MongoDB.
- /api/routes: maintains how backend links/routing works, and each route connects to a controller in the controllers folder.

/client - the angular frontend
- /client/src: contains styles.css, our main css file
- /client/src/app: where code goes for frontend, angular.js. Everything is separated into components.
- the .ts files contains js for connecting the frontend to the backend, and the html can use stuff defined in them
- pretty sure bootstrap is in here

Given example for the component files:
- To setup a page 'search' for example, we need search.component.html, search.component.ts and maybe search.component.css if you needed local styling.

/routes - Contains the routing.

app.js - This is where the back end is setup running Express and node.js. Shouldn't really have to change this much.
