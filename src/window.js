'use strict';

const electron = require('electron');
const Hapi = require('hapi');
const Path = require('path');
const open = require('open');

const {
  app,
  BrowserWindow
} = electron;

var mainWindow = null;

const port = 1337;

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, '')
      }
    }
  }
});

server.connection({ port: port });

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-finish-launching', () => {
  server.register(require('inert'), (err) => {
    if(err) {
      throw err;
    }

    server.route({
      method: 'GET',
      path: '/',
      handler(request, reply) {
        reply.file('index.html');
      }
    });

    server.route({
      method: 'GET',
      path: '/game/{route?}',
      handler(request, reply) {
        if(request.params.route && request.params.route === 'exit') {
          app.exit();
        } else {
          reply.file('index.html');
        }
      }
    });

    server.route({
      method: 'GET',
      path: '/assets/{filename}',
      handler(request, reply) {
        reply.file(`assets/${request.params.filename}`);
      }
    });

    server.start((err) => {
      if(err) {
        throw err;
      }

      console.log(`Hapi server running at: ${server.info.uri}`);
    });
  });
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480
  });

  mainWindow.loadURL(`http://localhost:${port}/game/`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('new-window', (event, url) => {
    event.preventDefault();

    open(url);
  });
});

app.on('will-quit', () => {
  server.stop({ timeout: 60 * 1000 }, (err) => {
    console.log('Server stopped');
  });
});
