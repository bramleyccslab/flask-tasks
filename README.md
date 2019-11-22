Basic Flask application for serving tasks/writing to database
=============================================================

A base Python/Flask project for serving e.g. psychology tests to
users from a single URL, keeping track of their status through task stages,
and writing appropriate results to a database.

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



### Modifying the task

In general, it should be sufficient to modify the HTML/CSS/JS in `app.templates`.

- `welcome.html` is a 'welcome page'. Put any description (or whatever) here. Add a link to start the task pointing to the root url ('/').
- `task.html` should contain the task. Data should be submitted via AJAX to the root url ('/'). It should expect a response containing
	`{completed: true}` or `{completed: false}`. The page should then be modified dynamically (i.e. saying 'thanks for completing') and maybe
	presenting some other data (e.g. a code for Mechanical Turk).

	(As currently stands, if you refresh the page from this point, you should see 'There was an error!'. This is because at this point it expects data to be send by AJAX request as JSON. Refresh again to get to the completed page.)

- `task_done.html` is only returned if a participant reloads the page. It should state that the participant cannot complete the task again. (This is done by maintaining a session cookie, which is hardly robust. A user can simply clear browser cookies and start again.) The app also logs hashed ip addresses which could be used to increase the robustness of the blocking if required.)

## Installation in Production Environment:

### 1. Prepare a task folder for production

- In the `main/view.py` file, around line 60, set `root_string` to be a unique name of your experiment (e.g. `myexp` for `bramleylab.ppls.ed.ac.uk/experiments/myexp`. 

- In the `main/models.py` file, edit the table names for the `Participant` class and `Task` class. (e.g. set ` _table_ = 'nb_flaskdemo_participant'` within the Participant class and `_table_ = 'nb_flaskdemo_task'` around line 58 within the Task class, in `main/models.py` around line 88). 

- To help us differentiate tables, it's recommended to prefix these tables with your initials and experiment name. These table names need to be unique too.

- Upload it to the home directory of the lab server (see handbook). It's suggested to clear system files, auto-created pycaches, flask_session, local dbs, .git folders etc. before the upload.

### 2. Create a production Python App

- Log into cPanel (see handbook), use the "Setup Python App" app to create a new python >3.4  environment. (Neil and Bonan found 3.7.3 worked for them, Philipp found he had to use 3.6.8 to include some of his libraries.)

- For the "Application root" field, put the name of the task folder you uploaded. (Neil used `flask` for the demo, so the app is housed in `bramleylab.ppls.ed.ac.uk/flask`).

- For the "Application URL" field, put `experiment/[ROOT_STRING]`, where root_string is the one you set in the `main/view.py` file in your task folder (around line 60).
	
- In the `passenger_wsgi.py` file, make sure that the line of code defining the application variable looks like this:
  ```
  application = create_app(os.getenv('FLASK_ENV') or 'config.ProductionConfig')
  ```
  Note: Bonan found `application = create_app('config.ProductionConfig')` works for her. But Philipp suggests to use the one above.

- Create the app.

### 3. Activate the app

Once you have created the python app, it automatically shows you the commands you need to run next.
	
- Open your terminal, secure shell terminal access to server:
  ```bash
  ssh wwwbramleylabppl@chost4.is.ed.ac.uk
  ```
- And input the SSH password (Ask Neil)

- Then activate the python you just created (you can copy paste from the "Setup Python App" page - in the yellow box on the top of the page after the app is created)
  ```bash
  source /home/wwwbramleylabppl/virtualenv/[yourpythonappname]/[yourpythonversion]/bin/activate
  ```
- `cd` to the location of your task folder, and manullly install the dependencies from `requirements.txt` there
   ```bash
   pip install -r path/to/requirements.txt
   ```
- Restart the Python app and check if the task appears.


### 4. Check if the task is alive

Go to the desired URL and check if the task is alive. 

For tables, go to "PhpPgAdmin" on cPanel to check if your tables have appeared in the database. Participants should have lines for every new, incomplete or ongoing session and Task should have a line for every complete session.



## Trouble shooting

- You may have to hard refresh the browser when viewing the app to see the latest version.

- Error logs go to the "Errors" App.

- In some cases, the `passenger_wsgi.py` will change after you source the application, and therefore fail to start the app. So after you sourced the app and installed required dependencies, double-check if your `passenger_wsgi.py` script looks like the one in your original task folder. If not, change it back can help the app starts as expected.

- To have access to your tables, you need to go to the "PostgreSQL Databases" app in cPanel, scroll down to the end, and click "Synchronize Grants".

## Important notes

- For actually running a study make sure to comment out `session.clear()` around line 143 so that participants cannot repeat the task.  (When in development the final refresh allows one to restart the task.)

- When distributing the experiment URL, do not add `/`. In other words, always use `bramleylab.ppls.ed.ac.uk/experiments/myexp`, *not* `bramleylab.ppls.ed.ac.uk/experiments/myexp/`, because the slash in the end will cause routing problem.

- `read_in_from_server.R` can be adapted to locally to pull the data and read it into R dataframes and save it as `.rData`
