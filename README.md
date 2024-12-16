[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/h8SwtrsU)
# COSI 116A Final Project - Housing Inequality

## The GitHub Pages Website

Github Pages Link:  
https://cosi116a-brandeis-infovis-fall23.github.io/cosi-116a-f24-final-project-repository-team-10/

Demo Video Link: https://youtu.be/4mFCSgQdDxA?si=dk9mBVGMW7Y-nTJh 
### Team Members:
1. Samiya Islam
2. Jaimie Louie
3. Kelden Dorji
4. Ian Ho

## Setup

1. Clone this repository to your local machine. E.g., in your terminal / command prompt `CD` to where you want this the folder for this activity to be. Then run `git clone <YOUR_REPO_URL>`

1. In `README.md` update the URL above to point to your GitHub pages website.

1. `CD` or open a terminal / command prompt window into the cloned folder.

1. Start a simple python webserver. E.g., one of these commands:
    * `python -m http.server 8000`
    * `python3 -m http.server 8000`
    * `py -m http.server 8000`
    If you are using Python 2 you will need to use `python -m SimpleHTTPServer 8000` instead, but please switch to Python 3 as [Python 2 was sunset on 2020.01.01](https://www.python.org/doc/sunset-python-2/).

1. Wait for the output: `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)`

1. Now open your web browser (Firefox or Chrome) and navigate to the URL: http://localhost:8000

## Root Files
* `README.md` is this explanatory file for the repo.

* `index.html` contains the main website content.

* `style.css` contains the CSS.

* `package.json` and `package-lock.json` contain dependencies for the libraries we used.

* `LICENCE` is the source code license.

## Folders
Each folder has an explanatory `README.md` file

* `data` includes our JSON data files.

* `favicons` contains the favicons for the course projects.

* `files` contain our slides (PDF) and demo video (MP4).

* `images` contains our application and sketch screenshots.

* `js` contains our JavaScript files.

  * `visualization.js` is the main code that builds our visualizations.
  
* `lib` contains the JavaScript libraries we used (d3).