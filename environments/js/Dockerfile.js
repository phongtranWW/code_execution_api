FROM node:slim

RUN useradd jsuser

WORKDIR /tmp/js

RUN chown -R jsuser:jsuser /tmp/js

USER jsuser

ENTRYPOINT ["/bin/sh", "-c", "node $FILE"]