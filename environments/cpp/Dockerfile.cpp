FROM gcc:10

RUN useradd cppuser

WORKDIR /tmp/cpp
RUN chown -R cppuser:cppuser /tmp/cpp

USER cppuser

ENTRYPOINT [ "/bin/sh", "-c", "g++ $FILE && ./a.out" ]
