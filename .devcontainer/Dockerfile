FROM mcr.microsoft.com/devcontainers/base:ubuntu

# uv (and uvx) installed globally from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Trust corporate TLS-inspection roots (e.g. Zscaler) system-wide.
# libnss3-tools provides certutil, used in post-create.sh to make Chrome trust them too.
# Drop .crt files into certs/ (git-ignored); the build succeeds without any.
COPY certs/ /tmp/certs/
RUN find /tmp/certs -maxdepth 1 -name '*.crt' -exec cp {} /usr/local/share/ca-certificates/ \; \
    && rm -rf /tmp/certs \
    && update-ca-certificates \
    && apt-get update \
    && apt-get install -y --no-install-recommends libnss3-tools \
    && rm -rf /var/lib/apt/lists/*
