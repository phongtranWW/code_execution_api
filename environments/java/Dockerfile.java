FROM openjdk:24-slim-bullseye

RUN useradd javauser

WORKDIR /tmp/java

COPY ./execution.sh .

RUN chown -R javauser:javauser /tmp/java
RUN chmod +x execution.sh

USER javauser

ENTRYPOINT ["/bin/sh", "-c", "javac $FILE && ./execution.sh"]
