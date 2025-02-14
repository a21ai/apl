VERSION 0.8

rustbase:
    FROM rust:latest
    WORKDIR /archway-turbo

setup:
    FROM +rustbase
    ENV CARGO_INCREMENTAL=0
    
    # Install required packages
    RUN apt-get update -y && \
        apt-get install -y --no-install-recommends \
        debian-archive-keyring \
        sudo make build-essential clang pkg-config curl libssl-dev git jq && \
        rm -rf /var/cache/apt/archives /var/lib/apt/lists/*
    RUN rustup component add rustfmt && rustup component add clippy
    RUN rustup default stable

deps:
    FROM +setup

    # Clean up and install Node.js
    RUN rm -rf /var/cache/apt/archives/* && \
        rm -rf /var/lib/apt/lists/* && \
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
        apt-get install -y nodejs && \
        rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*

    # Install yarn and turbo
    RUN npm install -g yarn turbo

    # Install Solana CLI tools
    #RUN sh -c "$(curl -sSfL https://release.solana.com/v1.17.16/install)" 
    RUN curl --proto '=https' --tlsv1.2 -sSfL https://raw.githubusercontent.com/solana-developers/solana-install/main/install.sh | bash
    RUN export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

build:
    FROM +deps

    RUN echo PATH: $PATH
    
    COPY . .
    
    # Install dependencies
    RUN yarn install --frozen-lockfile
    
    # Build everything using turbo
    RUN yarn turbo build
    
    # Save artifacts
    SAVE ARTIFACT programs/apl-sats/target/deploy/apl_sats.so AS LOCAL target/deploy/apl_sats.so
    SAVE ARTIFACT programs/apl-amm/target/deploy/apl_amm.so AS LOCAL target/deploy/apl_amm.so
    SAVE ARTIFACT packages/*/dist AS LOCAL packages/
    SAVE ARTIFACT apps/*/.next AS LOCAL apps/

test:
    FROM +build
    RUN yarn turbo test

lint:
    FROM +deps
    COPY . .
    RUN cargo fmt --all -- --check
    RUN cargo clippy --all-targets --all-features -- -D warnings

local:
    FROM +build 