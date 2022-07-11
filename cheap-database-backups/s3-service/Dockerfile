FROM ubuntu:22.04

ENV PATH="/builder/google-cloud-sdk/bin:${PATH}"

RUN apt-get -y update \
    # Install base dependencies
    && DEBIAN_FRONTEND=noninteractive TZ="America/New_York" apt-get -y install \
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
    ncat \
    # Setup Google Cloud SDK (latest)
    && mkdir -p /builder \
    && wget -qO- https://dl.google.com/dl/cloudsdk/release/google-cloud-sdk.tar.gz | tar zxv -C /builder \
    && /builder/google-cloud-sdk/install.sh --usage-reporting=false --bash-completion=false --disable-installation-options \
    # Install crcmod: https://cloud.google.com/storage/docs/gsutil/addlhelp/CRC32CandInstallingcrcmod
    && pip3 install -U crcmod \
    # Clean up
    && apt-get -y remove gcc python3-dev python3-setuptools wget \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf ~/.config/gcloud

COPY main.sh .
COPY sync_to_s3.sh .

CMD ["bash", "./main.sh"]
