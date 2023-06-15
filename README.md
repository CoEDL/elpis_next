# Elpis Next
This is a slimmer rewrite of the [elpis](https://github.com/CoEDL/elpis) project.

## Running the client and server
- First, clone the repo: `git clone https://github.com/CoEDL/elpis_next.git`
- `cd elpis_next`

### To run with docker:
- `docker compose build`
- `docker compose up`

This will spawn a client service at `https://localhost:3000` and the server at `https://localhost:5001`. It will also create a data directory at `./data` in which to store the state of the application. This data directory is bound to the host machine, so you can inspect what's going on in the application without needing to open another terminal session inside the container.

#### Troubleshooting
##### No space left on device (Docker)
- try `docker system prune --all`

If the error persists and you're trying to combine Docker Desktop with the WSL:
- uninstall Docker Desktop
- install Docker Engine through WSL (https://docs.docker.com/engine/install/)

##### Cannot connect to the docker daemon
- try `sudo service docker start`

##### Error getting credentials (running `docker compose build`)
Make sure you're logged in with credentials:
- `gpg --generate-key`
- `pass init <PUBLIC KEY (from above)>`
- `docker login` (create login through Docker Hub if necessary)

Still an issue?
- in `~/.docker/config.json`, try changing `credsStore` to `credStore` (or the other way around if you're using Docker Desktop)

##### `docker compose up` runs but doesn't set anything up at localhost:3000
Remove these lines from `./compose.yaml`:
```
    deploy:
      resources:
        limits:
          memory: 8gb
```

### To run a development build locally (without docker):
- `cd server`
- `poetry install`
- `poetry run python3 wsgi.py`

In another window:
- `cd client`
- `yarn && yarn dev`

Note: For the server to work properly during training and transcription, you might need to install some additional local dependencies:

- [ffmpeg](https://formulae.brew.sh/formula/ffmpeg) for resampling audio
- [libsndfile](https://formulae.brew.sh/formula/libsndfile) for librosa to load datasets.

#### Troubleshooting
##### Troubleshooting `libsndfile` errors
If you get an error message on Mac OS that reads along the lines of
```OSError: cannot load library [...] libsndfile.dylib' (no such file)```
try this:
```
brew install libsndfile
...

brew list libsndfile | grep dylib
/opt/homebrew/Cellar/libsndfile/1.1.0/lib/libsndfile.1.dylib
/opt/homebrew/Cellar/libsndfile/1.1.0/lib/libsndfile.dylib

ls -l /opt/homebrew/Cellar/libsndfile/1.1.0/lib/
total 912
-r--r--r--  1 raf  admin  466656 Jun 12 14:42 libsndfile.1.dylib
lrwxr-xr-x  1 raf  admin      18 Mar 27 14:42 libsndfile.dylib -> libsndfile.1.dylib
drwxr-xr-x  3 raf  admin      96 Jun 12 14:42 pkgconfig

SF_PATH=$(poetry env info -p)/lib/python3.10/site-packages/_soundfile_data/

mkdir -p $SF_PATH

ln -s $(brew list libsndfile | grep dylib | head -n 1) $SF_PATH/libsndfile.dylib

poetry shell

python3
>>> import soundfile
>>>
```

##### No module named 'poetry.repositories.http_repository'
[Install poetry](https://python-poetry.org/docs/)

##### ERROR: There are no scenarios; must have at least one. (Yarn)
You've got the wrong `yarn` (`cmdtest` package)---make sure it's through `npm install --global yarn`

Note: restart the terminal after this if it's still giving you grief

#### Firefox can't establish a connection to the server at ws://localhost:3000/_next/webpack-hmr
Try with a different browser


## Usage
Visit [localhost:3000](http://localhost:3000) and begin your transcription workflow!

### Creating a dataset
- Datasets > Create new
- You may want to enter relevant details before uploading files, as depending on the size of your dataset it may slow the browser down by quite a bit
- Upload the files
- Fill in any extra fields as necessary, then click Save

(It may take a little while to process)

### Training a model
- Navigate to the training page via any of the below routes:
    - Home > Train a Model
    - Datasets > Train Model
    - Train > Create New
    - Train > Upload Model
- Enter details as necessary
- Click the green arrow under the Train column of the table for any pre-existing model

### Transcribing audio
- Navigate to transcription page:
    - Home > Transcribe Audio > Create New
    - Train > Transcribe Audio
    - Transcribe > Create New
- Select trained model
- Add file for transcription
- Click Transcribe
- Click the green arrow under the column labelled Transcribe

### Runtime Troubleshooting
#### ffmpeg was not found but is required to load audio files from filename
Ensure ffmpeg is installed in your environment; restart and try again
