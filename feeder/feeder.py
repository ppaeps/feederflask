import asyncio
from aiohttp import ClientSession
from petkitaio import PetKitClient
from flask import (
    Blueprint, current_app, g, jsonify, render_template, request
)

bp = Blueprint('feeder', __name__)

def get_petkit_client(s):
        client = PetKitClient(current_app.config['PETKIT_USERNAME'],
                              current_app.config['PETKIT_PASSWORD'],
                              s,
                              current_app.config['PETKIT_REGION'])
        return client

@bp.route('/')
def index():
    return render_template('feeder/index.html')

@bp.route('/metrics')
async def metrics():
    async with ClientSession() as s:
        try:
            client = get_petkit_client(s)
            devices = await client.get_petkit_data()

            # We only have one feeder - it will always be last
            for k in devices.feeders:
                feeder=devices.feeders[k]
            return render_template('feeder/metrics.j2', feeder=feeder)
        except Exception as e:
            return jsonify(error=str(e)), 500

@bp.route('/get-data')
async def get_data():
    async with ClientSession() as s:
        try:
            client = get_petkit_client(s)
            devices = await client.get_petkit_data()
            return jsonify(devices)
        except Exception as e:
            return jsonify(error=str(e)), 500

@bp.route('/feed-kitty', methods=['POST'])
async def feed_kitty():
    j = request.get_json()

    # XXX this may want some error handling
    feeder = int(j['feeder'])
    if j['size'] == 'big':
        amount = 20
    else:
        amount = 10

    async with ClientSession() as s:
        try:
            client = get_petkit_client(s)
            devices = await client.get_petkit_data()
            await client.manual_feeding(feeder=devices.feeders[feeder],
                                        amount=amount)
            return jsonify(status="ok")
        except Exception as e:
            return jsonify(error=str(e)), 500

@bp.route('/reset-desiccant', methods=['POST'])
async def reset_desiccant():
    # XXX error handling
    j = request.get_json()
    f = int(j['feeder'])
    async with ClientSession() as s:
        try:
            client = get_petkit_client(s)
            devices = await client.get_petkit_data()
            await client.reset_feeder_desiccant(feeder=devices.feeders[f])
            return jsonify(status="ok")
        except Exception as e:
            return jsonify(error=str(e)), 500
