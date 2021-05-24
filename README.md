Basic Flask application for serving tasks/writing to database
=============================================================

A base Python/Flask project for serving e.g. psychology tests to
users from a single URL, keeping track of their status through task stages,
and writing appropriate results to a database.

For hosting a flask task on the lab server, checkout [this wiki page](https://github.com/bramleyccslab/flask-tasks/wiki/Hosting-on-eco).

## Requirements

Python 3 (good for any Python3 greater than 3.4)

A database (uses SQLite for testing; can use MySQL or PostgreSQL in production)

Flask

flask_session


### Running (development):

Create a virtual environment.  I use Anaconda so in my case I do


```bash
$ conda create -n py37flask python=3.7
```
then
```bash
$ conda activate py37flask
```

Or without Anaconda (i.e. on the server) you can:

```bash
$ python3 -m venv venv
```
and
```bash
$ source venv/bin/activate
```



Install dependencies

```bash
$ pip install -r requirements.txt
```

Run development server

```bash
$ python run.py runserver
```


## Description of project


- `config.py`: contains configuration for the project. Production settings will need to be modified to match your production environment (e.g. setting database)
- `run.py`: entry point for manually running the application in development (see above). A shell can be loaded thus:
- `passenger_wsgi.py`: creates a production application for running on CPanel.
- `requirements.txt`: the Python modules required for the project. (See above.)
- You should also set a SECRET_KEY for production.

```bash
$ python run.py shell
```
(N.B. All models will need to be manually imported in order to do anything in the shell)


- `flask_session` contains Participant sessions. Do not modify this folder, except to clear out old sessions maybe.

- `app`: the main application folder.


### Inside `app`:

- `templates` folder contains the base template. All other templates should override blocks in this template.
(For information on Flask templates, see: http://flask.pocoo.org/docs/1.0/tutorial/templates/)
- `main` is the only component of this application (i.e. a Flask blueprint)
- `main.models.py` specifies the Participant model and a Task model. The task model should be modified to match the data you wish to store.
- `main.views.py` contains the views: there is a *single* Flask view ('/') which dispatches requests to appropriate functions registered with the @task.register decorator, based on the Participant state. These task functions may be modified as required.

(This approach is designed to make all requests point to the same page, so a user cannot skip straight to the 'complete' page simply by knowing the URL.)

- `main.templates` contains the Flask templates for each page. These are returned by the task functions (via the render_template function)
- `main.utils` contains the utils for registering tasks, and some tricksy code for randomising order of tasks (ask RH about this if you need
to add more than one task and/or randomise the order). In general, don't worry about this folder.
- `main.static` contains CSS and JS for the applications. In order to add a static file, use the Flask template syntax:

```jinja2
	<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
```


## How to modify:


In general, it should be sufficient to modify the HTML/CSS/JS in `app.templates`.

- `welcome.html` is a 'welcome page'. Put any description (or whatever) here. Add a link to start the task pointing to the root url ('/').
- `task.html` should contain the task. Data should be submitted via AJAX to the root url ('/'). It should expect a response containing
	`{completed: true}` or `{completed: false}`. The page should then be modified dynamically (i.e. saying 'thanks for completing') and maybe
	presenting some other data (e.g. a code for Mechanical Turk).

	(As currently stands, if you refresh the page from this point, you should see 'There was an error!'. This is because at this point it expects data to be send by AJAX request as JSON. Refresh again to get to the completed page.)

- `task_done.html` is only returned if a participant reloads the page. It should state that the participant cannot complete the task again. (This is done by maintaining a session cookie, which is hardly robust. A user can simply clear browser cookies and start again.) The app also logs hashed ip addresses which could be used to increase the robustness of the blocking if required.)


## Important notes

- For actually running a study make sure to comment out `session.clear()` around line 143 so that participants cannot repeat the task.  (When in development the final refresh allows one to restart the task.)

- When distributing the experiment URL, do not add `/`. In other words, always use `bramleylab.ppls.ed.ac.uk/experiments/myexp`, *not* `bramleylab.ppls.ed.ac.uk/experiments/myexp/`, because the slash in the end will cause routing problem.

- `read_in_from_server.R` can be adapted to locally to pull the data and read it into R dataframes and save it as `.rData`
