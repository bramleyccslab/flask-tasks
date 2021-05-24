## Summary

This guide details how to set up Flask apps as a non-root user on eco, with only a small Apache configuration change needed for each app.

* Each user can run a number of separate Flask apps
* Each Flask app is run inside `gunicorn` which helps it to serve multiple requests faster
* The `gunicorn` processes (which contain the running Flask apps) are managed by `supervisord`, also run by the user. This will:
  * Start all apps when the server reboots
  * Restart apps if they crash
  * Provide a central place for the user to restart apps if their code has changed.
* There's an Apache server (running with its normal permissions) running for the whole server. This needs a small configuration change to serve each app to the internet.

## First ....

Log in to eco! All of the steps below should be performed on the server.

## One-off setup

### Miniconda

* Download miniconda with (e.g.) \
`curl https://repo.anaconda.com/miniconda/Miniconda3-py39_4.9.2-Linux-x86_64.sh -o anaconda.sh`
* (You can find the latest version for Linux on the Miniconda download page: [https://docs.conda.io/en/latest/miniconda.html](https://docs.conda.io/en/latest/miniconda.html) )
* Install Miniconda by running the installer e.g. `bash anaconda.sh`
* Follow the prompts and allow it to run `conda init`
* Log out of eco and back in, you should see `(base)` added to the prompt on your shell
* Check location and versions of pip/python if you want  
  `which pip` / `which python` / `pip --version` / `python --version`
  
### supervisor

* Install `supervisor` in your base environment. This will be shared between all your tasks.
  `pip install supervisor`
* Make a config directory and log directory in your home files e.g.
  `mkdir /home/atullo2/etc/ /home/atullo2/log`
* Edit a supervisord config file in the config directory e.g.:
  `nano /home/atullo2/etc/supervisord.conf`
  (this is just a suggestion, the file can be anywhere as we'll pass it to `supervisorctl`/`supervisord` explicitly)
* Add the following general config for `supervisord` and `supervisorctl` to the file:
```
[supervisord]
logfile=/home/atullo2/log/supervisor.log
loglevel=warn

[supervisorctl]
serverurl=unix:///home/atullo2/etc/supervisor.sock

[unix_http_server]
file=/home/atullo2/etc/supervisor.sock

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
```

### Making sure supervisord runs on reboot

* Edit your user's `crontab`. This is a list of programs to execute at regular intervals, but can also be used to specify something to run when the machine is restarted.
 `EDITOR=nano crontab -e`
 (You can specify a different editor if desired -- I use `nano` as I don't like `vi` which is the default).
* Add a line like:
 `@reboot /home/atullo2/miniconda3/bin/supervisord -c /home/atullo2/etc/supervisord.conf`
* This will make sure that your `supervisord` restarts when the machine is rebooted.

### Creating your DB user

* Ask an administrator to access the Postgres database and create a user who can create databases. They can do this with:  
 `sudo -u postgres psql`
 and then  
 `create user atullo2_db_user password 'RandomPassword1234' createdb login;`
* They will need to share the password with you!

## Per-app setup

### Flask app environment and code

* Create an environment for the app you want to run and give it a name. This will keep it separate if you have other tasks with different versions of libraries etc.  
  `conda create -n flasktasks python`
* Activate this environment  
  `conda activate flasktasks`
* Check out the code for your experiment  
  `git clone https://github.com/atullo2/flask-tasks.git`
* Install requirements  
  `pip install -r requirements.txt`
* Also install `gunicorn` (production WSGI server)  
  `pip install gunicorn`

### Flask configuration and database

* Create a new Postgres database with
  `createdb -h localhost -U atullo2_db_user atullo2_flasktasks_db;`
* Copy `config.py.template` to `config.py` and change the specifics to what you need
* In particular, the DB configuration should look something like:
```
    PONY = {
        'provider': 'postgres', 
        'host': '127.0.0.1',
        'user': 'atullo2_db_user',
        'password': 'RandomPassword1234',
        'database': 'atullo2_flasktasks_db'
    }
```
* To log in and take a look at your database on the Postgres SQL prompt, use:  
 `psql -h localhost -U atullo2_db_user atullo2_flasktasks_db;`  
  (this will be more interesting after the app has run once and created the tables)

### Choosing a port number and name/URL for the app

* Pick a port number. In this case I'll use 8000 as an example. The important thing is to use one which isn't in use by any other experiment -- you'll need a way to coordinate this. Port numbers for fixed services run by non-root users can range from 1024 to 32767 in Linux, so maybe give each person their own range of a few hundred ports, to avoid clashes.
* Test that `gunicorn` can run the code with:  
  `gunicorn testing_wsgi:application --bind localhost:8000`  
  for the test configuration or  
  `gunicorn wsgi:application --bind localhost:8000`  
  for the production configuration.
  The main difference between these two is the way that the database is configured. Try the test configuration first.
  The specifics of this will depend on names in your code, basically here `passenger_wsgi` is the file that creates the application and `application` is what it's called when that file has run. Here I'm using a file which references the Testing configuration.
* You can check what this server shows with  
  `curl http://localhost:8000 -o test.html` and then inspect test.html
* If this doesn't work check `config.py`, in particular `SERVER_NAME` can be a problem. Since we're just serving to localhost it can be removed.
* Pick a name for your app. This should be different to all the existing apps on the server.
* In this example, I'll use `atullo2_flasktasks`. So the app would be available as: `https://eco.ppls.ed.ac.uk/atullo2_flasktasks`

### Supervisor config

* Switch back to your base environment
  `conda activate base`
* Add a section to your `supervisord.conf`:
```
[program:flasktasks_gunicorn]
user=atullo2
directory=/home/atullo2/flask-tasks/
environment=SCRIPT_NAME=/atullo2_flasktasks
command=/home/atullo2/miniconda3/envs/flasktasks/bin/gunicorn --workers 2 --bind localhost:8000 wsgi:application
autostart=true
autorestart=true
stdout_logfile=/home/atullo2/flask-tasks/log/gunicorn.log
stderr_logfile=/home/atullo2/flask-tasks/log/gunicorn.err.log
```
* This tells `supervisord` how to manage your app
* To pick up this change you'll have to start (or restart) supervisor:  
  `killall supervisord`  
  `supervisord -c /home/atullo2/etc/supervisord.conf`
* `supervisord` automatically runs as a server process (daemon) so will return you to the command line.
* Change the paths to relate to this specific app
* For the line `command=` you can get the exact path for `gunicorn` with
 `which gunicorn`
* Note that `gunicorn` is now using `wsgi:application` which references the Production configuration. (See `wsgi.py`).
* You'll note this makes use of a log directory for the app, so create this:
  `mkdir /home/atullo2/flask-tasks/log`
* The line  
  `environment=SCRIPT_NAME=/atullo2_flasktasks`  
  should match the name that you chose for your application above.
* Start `supervisord` with:
  `supervisord -c /home/atullo2/etc/supervisord.conf`
* Since we specified `autostart=true` for `flasktasks_gunicorn`, it will already be started when `supervisord` started. You can test this with `curl` as above.
* This can be stopped with:
`supervisorctl -c /home/atullo2/etc/supervisord.conf stop flasktasks_gunicorn`
* `supervisorctl` also understands `start` and `restart` in the place of `stop` in this command, to start or restart (stop and then start) the program.
  
### When your Flask app code changes

* When you change the app's code you'll need to restart `gunicorn` to see the changes. So e.g. `supervisorctl -c /home/atullo2/etc/supervisord.conf restart flasktasks_gunicorn`

### Apache configuration

* Something similar to the following lines should be added to `/etc/httpd/conf.d/ssl.conf` by an administrator:
```
ProxyPass "/atullo2_flasktasks" "http://localhost:8000"
ProxyPassReverse "/atullo2_flasktasks" "http://localhost:8000"
```
* Substitute the name you are using and the port you chose above into these lines.
* This will have to be done by an administrator so please put in a support request to is.helpline@ed.ac.uk with the configuration that you want to add.
