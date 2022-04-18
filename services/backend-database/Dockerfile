FROM postgres:13-alpine

COPY postgresql.conf /etc/postgresql.conf

# Need to add "2>&1" so that stderr logs are redirected to stdout.
#
# This is because, for whatever reason, Postgres logs to stderr by default, but doesn't have an
# option to log to stdout... and we don't want everything on stderr otherwise all the database logs
# show up as errors in StackDriver.
#
# Obviously, this prevents us from having any logs actually marked as 'errors', but that's better than
# having literally everything marked as an 'error'.
#
# Note: Need to use the provided entrypoint script rather than the postgres command.
CMD ["/bin/sh", "-c", "/usr/local/bin/docker-entrypoint.sh -c config_file=/etc/postgresql.conf 2>&1"]
