FROM mysql:8.0

COPY ./database.sql /tmp

CMD [ "mysqld", "--init-file=/tmp/database.sql" ]