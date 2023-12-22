# FeederFlask

Monitor and control kitty's automatic feeder.

This is a Flask application around [PetKitAIO](https://github.com/RobertD502/petkitaio).  It enables basic day-to-day operation of a feeder.

## Features and limitations

- Webpage to dispense snacks
- Prometheus `/metrics` endpoint for monitoring and alerting
- Only supports a single feeder
- No security!

The PetKit API is undocumented and proprietary.  This will only work as long as PetKitAIO works.

This project was developed and tested with a single [PetKit Fresh Element Solo (D4)](https://petkit.com/products/fresh-element-solo).

There is intentionally no security.  Run this inside the firewall.

## Goals

- Add support for changing the feeding schedule
- Monitor more metrics (e.g. food running out)

## Usage

### Development

Set up a new virtual environment and install the project for editing:

```shell
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

Set configuration constants in `instance/config.py`:

```python
# These must be set for things to work.
PETKIT_USERNAME = 'your email address'
PETKIT_PASSWORD = 'your password'
PETKIT_REGION = 'a supported region'
```

Refer to the [PetKitAIO documentation](https://github.com/RobertD502/petkitaio)
for a list of supported regions.

Use the Flask built-in WSGI server:

```shell
flask --app feeder run --debug
```

### Production

Set up a new virtual environment and install the project for production:

```shell
python -m venv .venv
source .venv/bin/activate
pip install .
```

Set configuration constants.  Also configure a session secret.  This project
doesn't use sessions, but it's good practice in case that ever changes.  For
production, these go in `.venv/var/feeder-instance/config.py`:

```python
# Use `python -c 'import secrets; print(secrets.token_hex())'` to generate.
SECRET_KEY = 'random string here'

# These must be set for things to work.
PETKIT_USERNAME = 'your email address'
PETKIT_PASSWORD = 'your password'
PETKIT_REGION = 'a supported region'
```

Use the [Waitress WSGI server](https://github.com/Pylons/waitress):

```shell
waitress-serve --host 127.0.0.1 --port 5000 --url-prefix=/feeder --call feeder:create_app
```

Configure nginx as a reverse proxy with an appropriate access control list:

```nginx
location /feeder/ {
    # allow your-network-here;
    # allow your-network-here;
    # deny all;
    proxy_pass http://127.0.0.1:5000;
}
```
