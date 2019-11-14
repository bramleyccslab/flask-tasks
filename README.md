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
$ conda create -py37flask python=3.7
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


- `config.py`: contains configuration for the project. Production settings will need to be modified to 
	match your production environment (e.g. setting database)

	You should also set a SECRET_KEY for production.
- `run.py`: entry point for manually running the application in development (see above). A shell can be loaded thus:
- `passenger_wsgi.py`: creates a production application for running on CPanel.
- `requirements.txt`: the Python modules required for the project. (See above.)


```bash
$ python run.py shell
```

(n.b. All models will need to be manually imported in order to do anything in the shell)


- `flask_session` contains Participant sessions. Do not modify this folder, except to clear out old sessions maybe.

- `app`: the main application folder. 


### Inside `app`:

- `templates` folder contains the base template. All other templates should override blocks in this template.
(For information on Flask templates, see: http://flask.pocoo.org/docs/1.0/tutorial/templates/)

- `main` is the only component of this application (i.e. a Flask blueprint)
- `main.models.py` specifies the Participant model and a Task model. The task model should be modified
	to match the data you wish to store.
- `main.views.py` contains the views: there is a *single* Flask view ('/') which dispatches requests
	to appropriate functions registered with the @task.register decorator, based on the Participant state.
	These task functions may be modified as required.

	(This approach is designed to make all requests point to the same page, so a user cannot skip straight to the
	'complete' page simply by knowing the URL.)

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

- `task_intro.html` is a 'welcome page'. Put any description (or whatever) here. Add a link to start the task pointing to the root url ('/').
- `task.html` should contain the task. Data should be submitted via AJAX to the root url ('/'). It should expect a response containing 
	`{completed: true}` or `{completed: false}`. The page should then be modified dynamically (i.e. saying 'thanks for completing') and maybe
	presenting some other data (e.g. a code for Mechanical Turk).

	(As currently stands, if you refresh the page from this point, you should see 'There was an error!'. This is because
	at this point it expects data to be send by AJAX request as JSON. Refresh again to get to the completed page.)
- `task_done.html` is only returned if a participant reloads the page. It should state that the participant cannot complete the task again.
	(this is done by maintaining a session cookie, which is hardly robust. A user can simply clear browser cookies and start again. 
	If it needs to be more robust, you might consider some kind of IP address logging, probably hashing them first.)

## Installation in Production Environment:

- Once only: Create a python >3.4 (3.7.3 works) environment on the server using the Setup Python App icon on cPanel.

- Name the folder you wanna put the flask stuff in (outside of the html folder) under `App Directory /home/wwwbramleylabppl/` (I used `flask` for the demo) and the root you want to work as your app address under `App Domain/URI` (I used `bramleylab.ppls.ed.ac.uk/experiments/flaskdemo`)

- Secure shell terminal access to server:
  ```bash
  ssh wwwbramleylabppl@chost4.is.ed.ac.uk
  ```
- And input the SSH password (Ask Neil)

- Then in the terminal:
  ```bash
  source /home/wwwbramleylabppl/virtualenv/flask/3.7/bin/activate
  ```
- Manually install the dependencies from `requirements.txt` there
  ```bash
  pip install -r path/to/requirements.txt
  ```
- Replace the contents the folder with the flask app stuff `bramleylab.ppls.ed.ac.uk/flask`

- Data appears in postgres database

-`read_in_from_server.R` can be used locally to pull the data and read it into R dataframes and save it as `.rdata`

### Duplicating

- Create another python 3.7.3 app in Setup Python App in cPanel with a name associated with your experiment and a new folder (e.g. /flask2adapt). Note - In some instances the python 3.7.3 app might not enable you to install the python libraries that you wish to use. You can try e.g., python 3.6.8 instead (this solved the problem)
- Change the table names in models.py to unique tables reflecting your experiment (e.g. flask2adapt_participants around line 58 and flask2adapt_task around line 88)
- Update root_string in view.py to new desired url (e.g. flask2adapt) 
- in the passenger_wsgi.py file, make sure that the line of code defining the application variable looks like this:
application = create_app(os.getenv('FLASK_ENV') or 'config.ProductionConfig')
- Open terminal, activate environment and install dependencies as above
- Restart the new python app in Setup Python Apps (using cPanel)
- Try the url and check the postgres database.  There should be new tables.  You may need to change the priviledges to view them, if so try Tables->Privileges->Grant (Note, you will also go to PostgresSQL Databayses and press synchronise grants)
