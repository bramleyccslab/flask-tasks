### `root_string` and its replacement

As part of setting up Flask with gunicorn and supervisor, I removed `root_string` from the code.

This was used to provide the URL of the app in HTML and JavaScript.

Under supervisord and gunicorn this can be replaced by setting an environment variable `SCRIPT_NAME`. Flask picks this variable up and uses it to server the task on a particular path. Apache is configured to translate this path to one on the (outward-facing) web server.

The name `SCRIPT_NAME` is slightly misleading, it actually gives the base URL of the app, so fulfils a similar function to `root_string`.

### Replacing `root_string` in code

Where `root_string` was used in HTML, the alternative is to use `url_for()` in a template.

Where `root_string` was used in JavaScript, `url_for()` must be used in a HTML template in a place where it can then be accessed from JavaScript.

In this code, it's in `flask-tasks/app/templates/task.html`:

```html
<span id="root_url_holder" data-root-url="{{ url_for('main.task') }}"></span>
```

This can then be accessed from JavaScript with:

```javascript
const root_el = document.getElementById("root_url_holder");
const root_url = root_el.getAttribute("data-root-url");
```

This doesn't need to be a `<span>`, any element would do. Using an attribute beginning with `data-` is part of the HTML5 specification and indicates a user-defined attribute.
