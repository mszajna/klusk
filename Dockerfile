FROM mszajna/node-wrtc:latest

RUN yarn global add klusk

VOLUME /edit
WORKDIR /edit

CMD klusk
