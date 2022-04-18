# Note: Need to use postgres:13 instead of 13-alpine so that we can use apt-get.
# AKA, I'm too lazy to port this Dockerfile to Alpine, but not lazy enough to not run the main
# database with Alpine.
FROM postgres:13

ENV PATH="/builder/google-cloud-sdk/bin:${PATH}"

RUN apt-get -y update \
    # Install base dependencies
    && apt-get -y install \
        apt-transport-https \
        software-properties-common \
        ca-certificates \
        curl \
        wget \
        build-essential \
        python3 \
        python3-pip \
        python3-dev \
        python3-setuptools \
        awscli \
    # Setup Google Cloud SDK (latest)
    && mkdir -p /builder \
    && wget -qO- https://dl.google.com/dl/cloudsdk/release/google-cloud-sdk.tar.gz | tar zxv -C /builder \
    && /builder/google-cloud-sdk/install.sh --usage-reporting=false --bash-completion=false --disable-installation-options \
    # Install crcmod: https://cloud.google.com/storage/docs/gsutil/addlhelp/CRC32CandInstallingcrcmod
    && pip3 install -U crcmod \
    # Install kubectl
    && gcloud -q components install kubectl \
    # Clean up
    && apt-get -y remove gcc python3-dev python3-setuptools wget \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf ~/.config/gcloud

COPY backup_database.sh .

CMD ["sh", "./backup_database.sh"]
