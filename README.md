# Elpis Next

This is a slimmer rewrite of the [elpis project](https://github.com/CoEDL/elpis).

## Running the client and server

- First, clone the repo: `git clone https://github.com/CoEDL/elpis_next.git`
- `cd elpis_next`

### To run with docker:

- `docker compose build`
- `docker compose up`

This will spawn a client service at `https://localhost:3000` and the server at `https://localhost:5001`.
It will also create a data directory at `./data` in which to store the state of the application. This `data` directory is bound to the host machine,
so you can inspect what's going on in the application without needing to open another terminal session inside the container.

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
  If you have errors with libsndfile, you might want to see the troubleshooting section at the end of this document.

## Using the application

Now visit [localhost:3000](https://localhost:3000) and begin your transcription workflow!

### Troubleshooting `libsndfile` errors

If you get an error message on Mac Os that reads along the lines of:

```
OSError: cannot load library ... blah blah ... libsndfile.dylib' (no such file)
```

Here are the steps I took to fix this:

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
